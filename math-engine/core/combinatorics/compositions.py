def integer_compositions(n, k):
    if k == 1:
        yield [n]
    else:
        for i in range(n + 1):
            for tail in integer_compositions(n - i, k - 1):
                yield [i] + tail