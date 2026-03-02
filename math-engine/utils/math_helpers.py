import math
from fractions import Fraction

def lcm_multiple(numbers):
    from functools import reduce
    from number_theory.divisibility import lcm
    
    return reduce(lcm, numbers, 1)

def gcd_multiple(numbers):
    from functools import reduce
    from number_theory.divisibility import gcd
    
    return reduce(gcd, numbers)

def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0

def round_to_significant_digits(number, significant_digits=3):
    if number == 0:
        return 0
    
    magnitude = math.floor(math.log10(abs(number))) + 1
    scale = 10 ** (significant_digits - magnitude)
    
    return round(number * scale) / scale

def decimal_to_fraction(decimal, max_denominator=1000):
    return Fraction(decimal).limit_denominator(max_denominator)

def binomial_coefficient(n, k):
    from combinatorics.basic import combinations
    return combinations(n, k)

def degrees_to_radians(degrees):
    return degrees * (math.pi / 180)

def radians_to_degrees(radians):
    return radians * (180 / math.pi)

if __name__ == '__main__':
    print(f"LCM of [12, 18, 24]: {lcm_multiple([12, 18, 24])}")
    print(f"GCD of [12, 18, 24]: {gcd_multiple([12, 18, 24])}")
    print(f"Is 16 a power of 2? {is_power_of_two(16)}")
    print(f"Round pi to 4 significant digits: {round_to_significant_digits(math.pi, 4)}")
    print(f"Decimal 0.3333 as a fraction: {decimal_to_fraction(0.3333)}")
    print(f"Binomial coefficient (10 choose 3): {binomial_coefficient(10, 3)}")
    print(f"90 degrees in radians: {degrees_to_radians(90)}")
    print(f"π/2 radians in degrees: {radians_to_degrees(math.pi/2)}")
