const _ = require('underscore')
const bignum = require('bignum')
const secureRandom = require('crypto-random')
const prompt = require('prompt')

const PRIME_SIZE = 512

const bignum_to_bin = (number) => {
  const hex_string = number.toString(16)
  const output = _.range(hex_string.length).map((index) => {
    const short_binary = parseInt(hex_string.charAt(index), 16).toString(2)
    return '0000'.substring(short_binary.length) + short_binary
  }).join('')
  return output.substring(output.indexOf('1'))
}

const modexp = (base, exponent, mod) => {
  mutable_base = null
  return bignum_to_bin(exponent).split("").reverse().reduce((product, bit) => {
    mutable_base = mutable_base == null ? bignum(base).mod(mod) : (mutable_base.pow(2)).mod(mod)
    return bit == '1' ? (product.mul(mutable_base)).mod(mod) : product
  }, bignum(1))
}

const gcd = (a, b) => {
  const larger = a.gt(b) ? a : b
  const smaller = a.gt(b) ? b : a
  return smaller.gt(0) ? gcd(smaller, larger.mod(smaller)) : larger
}

const inv_mult = (modulus, num) => {
  var last_remainder = modulus.abs()
  var remainder = num.abs()
  var x = bignum(0)
  var last_x = bignum(1)
  var y = bignum(1)
  var last_y = bignum(0)
  while (!remainder.eq(bignum(0))) {
    const quotient = last_remainder.div(remainder)
    const temp_remainder = remainder
    remainder = last_remainder.mod(remainder)
    last_remainder = temp_remainder
    const temp_x = x
    x = last_x.sub(quotient.mul(x))
    last_x = temp_x
    const temp_y = y
    y = last_y.sub(quotient.mul(y))
    last_y = temp_y
  }
  if (last_remainder != 1) throw 'Not prime'
  return last_x.mul(bignum(modulus.lt(0) ? -1 : 1)).mod(num)
}

const initialize = () => {
  const e = bignum(65537)
  var p, q, n, phin, d
  do {
    do {
      p = bignum.prime(PRIME_SIZE, true)
      q = bignum.prime(PRIME_SIZE, true)
      n = p.mul(q)
      phin = p.sub(1).mul(q.sub(1))
    } while (gcd(e, phin) != 1)
    d = inv_mult(e, phin)
  } while (d.lt(0)) // Easier for autograder
  return {
    e: e,
    p: p,
    q: q,
    n: n,
    phin: phin,
    d: d
  }
}

const keys = initialize()
console.log(`p: ${keys.p}\nq: ${keys.q}\nn: ${keys.n}\ne: ${keys.e}\nd: ${keys.d}\n`)
prompt.get('Challenge encrypt', (err, result) => {
  const input_1 = result['Challenge encrypt']
  const cipher_text = modexp(input_1, keys.e, keys.n)
  console.log(`Ciphertext: ${cipher_text}\n`)
  prompt.get('Challenge decrypt', (err, result) => {
    const input_2 = result['Challenge decrypt']
    const cipher_text = modexp(input_2, keys.d, keys.n)
    console.log(`plaintext: ${cipher_text}\n`)
  })
})
