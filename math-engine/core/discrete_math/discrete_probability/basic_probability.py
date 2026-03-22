def probability(event, sample_space):
    if not sample_space:
        return 0
    return len(event) / len(sample_space)

def conditional_probability(a_and_b, b):
    if b == 0:
        return 0
    return a_and_b / b

def is_independent(prob_a, prob_b, joint_prob):
    expected = prob_a * prob_b
    return abs(joint_prob - expected) < 1e-10

def bayes_theorem(prior, likelihood, evidence):
    if evidence == 0:
        return 0
    return (likelihood * prior) / evidence

def expected_value(values, probabilities):
    if len(values) != len(probabilities):
        raise ValueError("Values and probabilities must have the same length")
    if not all(0 <= p <= 1 for p in probabilities):
        raise ValueError("Probabilities must be in range [0, 1]")
    if abs(sum(probabilities) - 1) > 1e-10:
        raise ValueError("Probabilities must sum to 1")
    return sum(v * p for v, p in zip(values, probabilities))

def variance(values, probabilities):
    exp_val = expected_value(values, probabilities) 
    exp_val_sq = sum((v**2) * p for v, p in zip(values, probabilities))
    return exp_val_sq - (exp_val ** 2)

