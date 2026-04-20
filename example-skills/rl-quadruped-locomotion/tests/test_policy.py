"""Smoke tests for the RL quadruped locomotion skill."""

import numpy as np
import pytest

from scripts.deploy_policy import build_observation
from scripts.train import RewardConfig, compute_reward


class TestObservationBuilder:
    def test_output_shape(self):
        obs = build_observation(
            joint_pos=np.zeros(12),
            joint_vel=np.zeros(12),
            body_orientation=np.zeros(3),
            body_angular_vel=np.zeros(3),
            cmd_velocity=np.zeros(3),
            gait_phase=np.zeros(4),
            prev_action=np.zeros(12),
        )
        assert obs.shape == (49,)
        assert obs.dtype == np.float32

    def test_values_propagated(self):
        joint_pos = np.ones(12) * 0.5
        obs = build_observation(
            joint_pos=joint_pos,
            joint_vel=np.zeros(12),
            body_orientation=np.zeros(3),
            body_angular_vel=np.zeros(3),
            cmd_velocity=np.zeros(3),
            gait_phase=np.zeros(4),
            prev_action=np.zeros(12),
        )
        np.testing.assert_allclose(obs[:12], 0.5)


class TestRewardFunction:
    @pytest.fixture
    def default_config(self):
        return RewardConfig()

    @pytest.fixture
    def perfect_state(self):
        return {
            "base_lin_vel": [1.0, 0.0, 0.0],
            "base_ang_vel": [0.0, 0.0, 0.0],
            "orientation_error": 0.0,
            "torques": np.zeros(12),
            "action_diff": np.zeros(12),
            "foot_slip_sum": 0.0,
            "feet_air_time_bonus": 0.5,
        }

    def test_perfect_tracking_gives_high_reward(self, default_config, perfect_state):
        cmd = {"vx": 1.0, "vy": 0.0, "wz": 0.0}
        reward = compute_reward(perfect_state, cmd, default_config)
        assert reward > 1.5

    def test_large_velocity_error_gives_low_reward(self, default_config, perfect_state):
        cmd_good = {"vx": 1.0, "vy": 0.0, "wz": 0.0}
        cmd_bad = {"vx": 5.0, "vy": 0.0, "wz": 0.0}
        r_good = compute_reward(perfect_state, cmd_good, default_config)
        r_bad = compute_reward(perfect_state, cmd_bad, default_config)
        assert r_good > r_bad

    def test_torque_penalty_reduces_reward(self, default_config, perfect_state):
        cmd = {"vx": 1.0, "vy": 0.0, "wz": 0.0}
        r_low_torque = compute_reward(perfect_state, cmd, default_config)
        perfect_state["torques"] = np.ones(12) * 50.0
        r_high_torque = compute_reward(perfect_state, cmd, default_config)
        assert r_low_torque > r_high_torque

    def test_foot_slip_penalty(self, default_config, perfect_state):
        cmd = {"vx": 1.0, "vy": 0.0, "wz": 0.0}
        r_no_slip = compute_reward(perfect_state, cmd, default_config)
        perfect_state["foot_slip_sum"] = 5.0
        r_slip = compute_reward(perfect_state, cmd, default_config)
        assert r_no_slip > r_slip
