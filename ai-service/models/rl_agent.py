"""
RL AGENT — Deep Q-Network for Drone/Crew Route Optimization
Usage:
    from models.rl_agent import RLRouteAgent
    agent = RLRouteAgent(num_work_orders=10)
    agent.train(episodes=1000)
    route = agent.predict(work_orders, start_pos)
"""
import math, random
from collections import deque
try:
    import torch, torch.nn as nn, torch.optim as optim
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

class QNetwork(nn.Module if TORCH_AVAILABLE else object):
    def __init__(self, state_dim, action_dim, hidden=128):
        if not TORCH_AVAILABLE: raise ImportError("pip install torch")
        super().__init__()
        self.fc1 = nn.Linear(state_dim, hidden); self.fc2 = nn.Linear(hidden, hidden); self.fc3 = nn.Linear(hidden, hidden); self.fc4 = nn.Linear(hidden, action_dim); self.relu = nn.ReLU()
    def forward(self, x):
        x = self.relu(self.fc1(x)); x = self.relu(self.fc2(x)); x = self.relu(self.fc3(x)); return self.fc4(x)

class ReplayBuffer:
    def __init__(self, capacity=10000): self.buffer = deque(maxlen=capacity)
    def push(self, state, action, reward, next_state, done): self.buffer.append((state, action, reward, next_state, done))
    def sample(self, batch_size):
        batch = random.sample(self.buffer, min(batch_size, len(self.buffer)))
        states, actions, rewards, next_states, dones = zip(*batch)
        return (torch.stack(states), torch.tensor(actions), torch.tensor(rewards, dtype=torch.float32), torch.stack(next_states), torch.tensor(dones, dtype=torch.float32))
    def __len__(self): return len(self.buffer)

class RLRouteAgent:
    def __init__(self, num_work_orders=10, lr=1e-3, gamma=0.95, epsilon=1.0, epsilon_decay=0.995, min_epsilon=0.01, batch_size=32, target_update=10):
        if not TORCH_AVAILABLE: raise ImportError("pip install torch")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.num_work_orders = num_work_orders
        self.state_dim = 2 + num_work_orders * 3
        self.action_dim = num_work_orders
        self.q_net = QNetwork(self.state_dim, self.action_dim).to(self.device)
        self.target_net = QNetwork(self.state_dim, self.action_dim).to(self.device)
        self.target_net.load_state_dict(self.q_net.state_dict())
        self.optimizer = optim.Adam(self.q_net.parameters(), lr=lr)
        self.replay_buffer = ReplayBuffer(10000)
        self.gamma = gamma; self.epsilon = epsilon; self.epsilon_decay = epsilon_decay; self.min_epsilon = min_epsilon; self.batch_size = batch_size; self.target_update = target_update; self.steps = 0
    def _haversine(self, p1, p2):
        R = 6371; dlat = math.radians(p2[0] - p1[0]); dlng = math.radians(p2[1] - p1[1])
        a = (math.sin(dlat / 2) ** 2 + math.cos(math.radians(p1[0])) * math.cos(math.radians(p2[0])) * math.sin(dlng / 2) ** 2)
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    def _build_state(self, current_pos, work_orders):
        state = [current_pos[0], current_pos[1]]
        for wo in work_orders:
            wo_pos = wo.get("location", {}).get("gps", wo.get("gps", {"lat": 0, "lng": 0}))
            lat = wo_pos.get("lat", 0) if isinstance(wo_pos, dict) else wo_pos[0]
            lng = wo_pos.get("lng", 0) if isinstance(wo_pos, dict) else wo_pos[1]
            dist = self._haversine(current_pos, (lat, lng))
            urgency = wo.get("urgency_score", 50) / 100.0
            sla_ms = 0
            if wo.get("sla_deadline"):
                from datetime import datetime
                if isinstance(wo["sla_deadline"], str): sla_dt = datetime.fromisoformat(wo["sla_deadline"].replace("Z", ""))
                else: sla_dt = wo["sla_deadline"]
                sla_ms = max(0, (sla_dt - datetime.now()).total_seconds() / 3600)
            sla_urgency = 1.0 / (1.0 + sla_ms) if sla_ms > 0 else 1.0
            state.extend([urgency, sla_urgency, min(dist / 50, 1.0)])
        while len(state) < self.state_dim: state.extend([0, 0, 0])
        return torch.tensor(state[:self.state_dim], dtype=torch.float32).to(self.device)
    def _compute_reward(self, wo, distance):
        urgency = wo.get("urgency_score", 50) / 100.0
        reward = urgency * 10 - distance * 0.5
        if wo.get("sla_deadline"):
            from datetime import datetime
            if isinstance(wo["sla_deadline"], str): sla_dt = datetime.fromisoformat(wo["sla_deadline"].replace("Z", ""))
            else: sla_dt = wo["sla_deadline"]
            if sla_dt < datetime.now(): reward -= 20
        return reward
    def select_action(self, state, unvisited_indices):
        if random.random() < self.epsilon: return random.choice(unvisited_indices)
        with torch.no_grad():
            q_values = self.q_net(state); mask = torch.full_like(q_values, float('-inf'))
            for idx in unvisited_indices: mask[idx] = q_values[idx]
            return mask.argmax().item()
    def train(self, work_orders_batches, episodes=1000):
        print(f"[RL TRAINING] Starting DQN training for {episodes} episodes")
        for ep in range(episodes):
            work_orders = random.choice(work_orders_batches)
            if len(work_orders) > self.num_work_orders: work_orders = work_orders[:self.num_work_orders]
            depot = (12.9716, 77.5946); current_pos = depot; unvisited = list(range(len(work_orders))); total_reward = 0
            while unvisited:
                state = self._build_state(current_pos, work_orders); action = self.select_action(state, unvisited)
                wo = work_orders[action]; wo_pos = wo.get("location", {}).get("gps", {})
                wo_lat = wo_pos.get("lat", 0) if isinstance(wo_pos, dict) else wo_pos[0]
                wo_lng = wo_pos.get("lng", 0) if isinstance(wo_pos, dict) else wo_pos[1]
                distance = self._haversine(current_pos, (wo_lat, wo_lng)); reward = self._compute_reward(wo, distance)
                unvisited.remove(action); next_pos = (wo_lat, wo_lng); next_state = self._build_state(next_pos, work_orders); done = len(unvisited) == 0
                self.replay_buffer.push(state, action, reward, next_state, done); current_pos = next_pos; total_reward += reward
                if len(self.replay_buffer) >= self.batch_size: self._train_step()
            self.epsilon = max(self.min_epsilon, self.epsilon * self.epsilon_decay)
            if ep % self.target_update == 0: self.target_net.load_state_dict(self.q_net.state_dict())
            if (ep + 1) % 100 == 0: print(f"  Episode {ep+1}/{episodes} | Reward: {total_reward:.1f} | Epsilon: {self.epsilon:.4f}")
        print(f"[RL TRAINING COMPLETE]")
    def _train_step(self):
        states, actions, rewards, next_states, dones = self.replay_buffer.sample(self.batch_size)
        q_values = self.q_net(states).gather(1, actions.unsqueeze(1)).squeeze()
        with torch.no_grad():
            next_q = self.target_net(next_states).max(1)[0]; targets = rewards + self.gamma * next_q * (1 - dones)
        loss = nn.MSELoss()(q_values, targets); self.optimizer.zero_grad(); loss.backward(); self.optimizer.step(); self.steps += 1
    def predict(self, work_orders, start_pos=(12.9716, 77.5946)):
        self.q_net.eval(); current_pos = start_pos; unvisited = list(range(len(work_orders))); route = []; total_dist = 0
        while unvisited:
            state = self._build_state(current_pos, work_orders)
            with torch.no_grad():
                q_values = self.q_net(state); mask = torch.full_like(q_values, float('-inf'))
                for idx in unvisited: mask[idx] = q_values[idx]
                action = mask.argmax().item()
            wo = work_orders[action]; wo_pos = wo.get("location", {}).get("gps", {})
            wo_lat = wo_pos.get("lat", 0) if isinstance(wo_pos, dict) else wo_pos[0]
            wo_lng = wo_pos.get("lng", 0) if isinstance(wo_pos, dict) else wo_pos[1]
            total_dist += self._haversine(current_pos, (wo_lat, wo_lng)); route.append(wo); current_pos = (wo_lat, wo_lng); unvisited.remove(action)
        total_dist += self._haversine(current_pos, start_pos); self.q_net.train()
        return { "route": route, "total_distance_km": round(total_dist, 2), "num_stops": len(route) }
    def save(self, path="models/rl_model.pt"):
        torch.save({"q_net": self.q_net.state_dict(), "target_net": self.target_net.state_dict(), "epsilon": self.epsilon, "steps": self.steps}, path)
        print(f"[RL] Model saved to {path}")
    def load(self, path="models/rl_model.pt"):
        checkpoint = torch.load(path, map_location=self.device)
        self.q_net.load_state_dict(checkpoint["q_net"]); self.target_net.load_state_dict(checkpoint["target_net"]); self.epsilon = checkpoint["epsilon"]; self.steps = checkpoint["steps"]
        print(f"[RL] Model loaded from {path}")
