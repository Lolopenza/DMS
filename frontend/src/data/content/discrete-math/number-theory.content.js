const numberTheoryContent = {
  overview:
    'Number theory studies integers and divisibility. This module covers core computations such as GCD/LCM, divisors, prime factorization, Euler’s totient, and modular arithmetic helpers (fast exponentiation and modular inverses). The key theme is using divisibility structure to compute efficiently.',
  outcomes: [
    'Compute GCD/LCM and understand their meaning.',
    'Factorize integers into primes and list divisors.',
    'Use Euler’s totient function in basic counting settings.',
    'Perform modular exponentiation and compute modular inverses when they exist.',
    'Use the Euclidean algorithm idea to reason about gcd computations.',
  ],
  formulas: [
    { title: 'GCD', content: '$$\\gcd(a,b)=\\max\\{d\\mid d\\mid a \\;\\wedge\\; d\\mid b\\}$$' },
    { title: 'Totient', content: '$$\\varphi(n)=|\\{1\\le k\\le n : \\gcd(k,n)=1\\}|$$' },
    { title: 'Modular inverse', content: '$$a^{-1}\\bmod m\\text{ exists }\\iff \\gcd(a,m)=1$$' },
    { title: 'Euclidean algorithm (identity)', content: '$$\\gcd(a,b)=\\gcd(b,\\,a\\bmod b)$$' },
  ],
  examples: [
    {
      title: 'Worked example: GCD and LCM',
      content: 'For \(24\) and \(36\): \\(\\gcd(24,36)=12\\) and \\(\\mathrm{lcm}(24,36)=72\\).',
    },
    {
      title: 'Worked example: modular inverse existence',
      content: [
        'To have an inverse of \(a\\) modulo \(m\\), we need \\(\\gcd(a,m)=1\\).',
        'For example, \\(a=5\\) modulo \\(m=12\\):',
        '$$\\gcd(5,12)=1\\Rightarrow 5^{-1}\\bmod 12\\text{ exists.}$$',
        '(Indeed \(5\\cdot 5=25\\equiv 1\\pmod{12}\\), so \(5^{-1}\\equiv 5\\).)',
      ].join('\n'),
    },
  ],
};

export default numberTheoryContent;

