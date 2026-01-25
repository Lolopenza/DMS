def all_permutations(seq):
    if len(seq) <= 1:
        yield seq
    else:
        for i in range(len(seq)):
            for perm in all_permutations(seq[:i] + seq[i+1:]):
                yield [seq[i]] + perm