from core.discrete_probability.basic_probability import expected_value, variance

class DiscreteRandomVariable:
    def __init__(self, values, probabilities, name=None):
        if len(values) != len(probabilities):
            raise ValueError("Values and probabilities must have the same length")
        if not all(0 <= p <= 1 for p in probabilities):
            raise ValueError("Probabilities must be in range [0, 1]")
        if abs(sum(probabilities) - 1) > 1e-10:
            raise ValueError("Probabilities must sum to 1")
            
        self.value_prob_map = dict(zip(values, probabilities))
        self.values = list(values)
        self.probabilities = list(probabilities)
        self.name = name or "X"
    
    def probability(self, value):
        return self.value_prob_map.get(value, 0)
    
    def expected_value(self):
        return expected_value(self.values, self.probabilities)
    
    def variance(self):
        return variance(self.values, self.probabilities)
    
    def standard_deviation(self):
        return self.variance() ** 0.5
    
    def cdf(self, value):
        return sum(p for v, p in zip(self.values, self.probabilities) if v <= value)
    
    def transform(self, function):
        new_values = [function(v) for v in self.values]
        
        new_value_prob_map = {}
        for old_val, new_val, prob in zip(self.values, new_values, self.probabilities):
            new_value_prob_map[new_val] = new_value_prob_map.get(new_val, 0) + prob
            
        return DiscreteRandomVariable(
            list(new_value_prob_map.keys()),
            list(new_value_prob_map.values()),
            name=f"{function.__name__}({self.name})"
        )
    
    def __str__(self):
        table = f"Random Variable: {self.name}\n"
        table += "Value | Probability\n"
        table += "------|------------\n"
        for v, p in zip(self.values, self.probabilities):
            table += f"{v:<5} | {p:.4f}\n"
        return table

def bernoulli_distribution(p, name=None):
    if not 0 <= p <= 1:
        raise ValueError("Probability p must be between 0 and 1")
    
    return DiscreteRandomVariable([1, 0], [p, 1-p], name or "X")

def binomial_distribution(n, p, name=None):
    from combinatorics.basic import combinations
    
    if not isinstance(n, int) or n < 0:
        raise ValueError("Number of trials n must be a non-negative integer")
    if not 0 <= p <= 1:
        raise ValueError("Probability p must be between 0 and 1")
        
    values = list(range(n + 1))
    probabilities = [combinations(n, k) * (p ** k) * ((1 - p) ** (n - k)) for k in values]
    
    return DiscreteRandomVariable(values, probabilities, name or "X")

def geometric_distribution(p, name=None):
    if not 0 < p <= 1:
        raise ValueError("Probability p must be between 0 and 1")
        
    values = []
    probabilities = []
    
    current_prob = p
    remaining_prob = 1.0
    k = 1
    
    while remaining_prob > 1e-10 and k <= 1000: 
        values.append(k)
        prob_k = (1 - p)**(k - 1) * p
        probabilities.append(prob_k)
        remaining_prob -= prob_k
        k += 1
        
    return DiscreteRandomVariable(values, probabilities, name or "X")

def uniform_discrete_distribution(a, b, name=None):
    if not isinstance(a, int) or not isinstance(b, int) or a > b:
        raise ValueError("a and b must be integers with a <= b")
        
    n = b - a + 1
    values = list(range(a, b + 1))
    probabilities = [1/n] * n
    
    return DiscreteRandomVariable(values, probabilities, name or "X")

def expected_value(values, probabilities):
    return sum(v * p for v, p in zip(values, probabilities))

def variance(values, probabilities):
    mu = expected_value(values, probabilities)
    return sum(p * (v - mu) ** 2 for v, p in zip(values, probabilities))

def pmf_binomial(n, p, k):
    from math import comb
    return comb(n, k) * (p ** k) * ((1 - p) ** (n - k))

def pmf_poisson(lmbda, k):
    from math import exp, factorial
    return (lmbda ** k) * exp(-lmbda) / factorial(k)

def pmf_geometric(p, k):
    return ((1 - p) ** (k - 1)) * p

if __name__ == '__main__':
    print("Bernoulli(0.6):")
    X_bern = bernoulli_distribution(0.6)
    print(X_bern)
    print(f"E[X] = {X_bern.expected_value()}")
    print(f"Var(X) = {X_bern.variance()}")
    
    print("\nBinomial(5, 0.4):")
    X_bin = binomial_distribution(5, 0.4)
    print(X_bin)
    print(f"E[X] = {X_bin.expected_value()}")
    print(f"Var(X) = {X_bin.variance()}")
    print(f"P(X=2) = {X_bin.probability(2)}")
    print(f"CDF(3) = P(X<=3) = {X_bin.cdf(3)}")
    
    print("\nGeometric(0.2):")
    X_geom = geometric_distribution(0.2)
    print(X_geom)
    print(f"E[X] = {X_geom.expected_value()}")
    
    print("\nUniformDiscrete(1, 6):")
    X_unif = uniform_discrete_distribution(1, 6)
    print(X_unif)
    print(f"E[X] = {X_unif.expected_value()}")
