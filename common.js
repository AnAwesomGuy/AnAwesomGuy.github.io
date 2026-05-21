"use strict";

// FRACTIONS are represented as: [numerator, denominator]
// SQUARE ROOTS are represented as: [radicand, coefficient]

// const originalToString = Array.prototype.toString
// Array.prototype.toString = () => {
	// if (this.length == 2 && Number.isInteger(this[1])) {
		// [this[0], this[1]] = reduce(this[0], this[1])
		// return fancyFraction(this[0], this[1])
	// }
	// return originalToString.call(this)
// }

// returns [numerator, denominator] (reduced) or null if invalid
// input should be in the style of (in parens are optional): (integer )numerator(/denominator)
function parseFraction(input) {
	if (typeof input === "string") {
		if (!input)
			return // undefined
		var split = input.split("/")
		if (split.length == 2) {
			var first = split[0].trim().split(" ")
			var first0 = parseIntOrNaN(first[0])
			var denominator = parseIntOrNaN(split[1])
			if (isFinite(first0) && denominator != 0 && isFinite(denominator)) {
				if (first.length == 1)
					return reduce(first0, denominator)
				else if (first.length == 2) {
					var numerator = +first[1]
					if (Number.isInteger(numerator))
						return reduce(numerator + first0 * denominator, denominator)
				}
			}
		}
	}
	var number = +input
	if (Number.isFinite(number))
		return toFraction(number)
	// return undefined
}
function parseIntOrNaN(string) {
	if (string) {
		var integer = +string
		if (Number.isInteger(integer))
			return integer
	}
}
// returns [[radicand, coefficient, imaginary (bool)], denominator]
function simplifySqrtFrac(numerator, denominator = 1) {
	if (numerator == 0)
		return [[0, 0, false], 1]
	if (denominator == 0)
		throw "division by 0";

	[numerator, denominator] = reduce(numerator, denominator)
	var imaginary = false
	if (denominator == 1) {
		if (numerator < 0) {
			imaginary = true
			numerator = -numerator
		}
		var [numerRadic, numerCoeff] = simplifySqrt(numerator)
		return [[numerRadic, numerCoeff, imaginary], 1]
	}
	if ((numerator < 0 && denominator > 0) || (numerator > 0 && denominator < 0)) // imaginary if only one is < 0
		imaginary = true
	numerator = Math.abs(numerator)
	denominator = Math.abs(denominator)
	var [denomRadic, denomCoeff] = simplifySqrt(denominator)
	var denom = denomCoeff
	if (denomRadic != 1) {
		numerator *= denomRadic
		denom *= denomRadic
	}
	var [numerRadic, numerCoeff] = simplifySqrt(numerator)
	var [reducedN, reducedD] = reduce(numerCoeff, denom)
	return [[numerRadic, reducedN, imaginary], reducedD]
}
// returns [radicand, coefficient]; if coefficient or radicand is one, it can be safely ignored
function simplifySqrt(radicand) {
	radicand = +radicand
	if (radicand < 0 || !Number.isInteger(radicand))
		throw `radicand ${radicand} is less than 0 or not an integer!`
	var sqrt = Math.sqrt(radicand)
	if (Number.isInteger(sqrt))
		return [1, sqrt] // sqrt is already a whole number
	var coefficient = 1
	while (radicand % 4 == 0) { // check 2 first
		coefficient *= 2
		radicand /= 4
	}
	while (radicand % 9 == 0) { // check 3 first
		coefficient *= 3
		radicand /= 9
	}
	// iterates through numbers and if the radicand is divisible by its square, move it to the coefficient
	for (var i = 5;; i += 2) { // skips 2s cuz we checked already
		if (i % 3 == 0) continue // skip 3s
		var iSqr = i * i
		if (iSqr > radicand) break // break if over
		while (radicand % iSqr == 0) {
			coefficient *= i
			radicand /= iSqr
		}
	}
	return [radicand, coefficient]
}
// returns [radicand, coefficient]; if coefficient or radicand is one, it can be safely ignored
function simplifyRoot(radicand, index) {
	radicand = +radicand
	index = +index
	if (index == 2)
		return simplifySqrt(radicand)
	if (radicand < 0 || !Number.isInteger(radicand))
		throw `radicand ${radicand} is less than 0 or not an integer!`
	if (index < 0 || !Number.isInteger(index))
		throw `n ${index} is less than 0 or not an integer!`
	var coefficient = 1, twoToTheIndex = 1 << index, threeToTheIndex = ipow(3, index)
	while (radicand % twoToTheIndex == 0) { // check 2 first
		coefficient *= 2
		radicand /= twoToTheIndex
	}
	while (radicand % threeToTheIndex == 0) { // check 3 first
		coefficient *= 3
		radicand /= threeToTheIndex
	}
	// iterates through numbers and if the radicand is divisible by its square, move it to the coefficient
	for (var i = 5;; i += 2) { // skips 2s cuz we checked already
		if (i % 3 == 0) continue // skip 3s
		var iToTheIndex = ipow(i, index)
		if (iToTheIndex >= radicand) break // break if over
		while (radicand % iToTheIndex == 0) {
			coefficient *= i
			radicand /= iToTheIndex
		}
	}
	return [radicand, coefficient]
}
function ipow(base, exponent) {
	if (!Number.isInteger(exponent) || exponent < 0)
		throw `negative or non-integer exponent ${exponent}`
	if (!Number.isInteger(base))
		throw `non-integer base ${base}`
	switch (base) {
		case 0:
			return (exponent === 0) ? 1 : 0
		case 1:
			return 1
		case -1:
			return ((exponent & 1) === 0) ? 1 : -1
		case 2:
			return 1 << exponent
		case -2:
			return ((exponent & 1) === 0) ? (1 << exponent) : -(1 << exponent)
	}
	for (var accum = 1; ; exponent >>= 1) {
		if (exponent == 0)
			return accum
		if (exponent == 1)
			return base * accum
		accum *= ((exponent & 1) == 0) ? 1 : base
		base *= base
	}
}
function sqrtText(radicand, coefficient = "") {
	if (coefficient === 0)
		return 0
	if (radicand == 1)
		return coefficient === "" ? 1 : coefficient // if coefficient is an empty string return 1
	if (coefficient === 1)
		coefficient = ""
	return coefficient + `<span class="sqrt"><span class="radicand">${radicand}</span></span>`
}
// returns a FRACTION in its simplest form. the returned FRACTION's denominator will always be positive.
function reduce(numerator, denominator) {
	if (numerator == 1 || denominator == 1)
		return [numerator, denominator]
	if (numerator == -1)
		return denominator < 0 ? [-numerator, -denominator] : [numerator, denominator]
	if (numerator == denominator)
		return [1, 1]
	numerator = +numerator
	denominator = +denominator
	if (!Number.isFinite(numerator) || !Number.isFinite(denominator))
		return [numerator, denominator] // return for non numbers or Infinity/NaN

	if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
		var fraction = divFrac(toFraction(numerator), toFraction(denominator))
		numerator = fraction[0]
		denominator = fraction[1]
	}

	var n = Math.abs(gcd(numerator, denominator))
	if (denominator < 0)
		n = -n
	return [numerator / n, denominator / n]
}
function gcd(a, b) {
	var c
	while (b) {
		c = a % b
		a = b
		b = c
	}
	return a
}
/*
adapted from https://stackoverflow.com/a/14011299
returns [numerator, denominator]
uses continuous fractions to find fraction equivalent

for example, 2.4:
2 +   1     // 12 is from floor(12), with 0.4 left over
    -----
    2 + 1   // 2 is from floor(1/0.4), with 0.5 left over
        -
        2   // 2 is from 1/0.5
now, we can calculate the total fraction from here: 12/5

another example: 21.76923076923077
21 +      1        // 0.76923076923077 left
     -----------
     1 +    1      // 1/0.76923076923077 = 1.3
         -------
         3 +  1    // 1/0.3 = 3.33333333...
             ---
              3    // 1/0.33333333... = 3
result: [21,1,3,3]
the total denominator is the last two multiplied + 1 = 3*3+1 = 13
the result is 283/13
*/
function toFraction(x, epsilon = Number.EPSILON) {
	x = +x
	if (Number.isInteger(x) || !Number.isFinite(x))
		return [x, 1]

	var h = Math.floor(x), h1 = 1, h2, k = 1, k1 = 0, k2, a = h, xOld = x
	epsilon *= Math.abs(a) + 1

	while (x - a > epsilon * k * k) {
		x = 1 / (x - a)
		a = Math.floor(x)
		h2 = h1; h1 = h
		k2 = k1; k1 = k
		h = h2 + a * h1
		k = k2 + a * k1
	}

	if (h / k != xOld)
		console.log("toFraction returned incorrect results! Difference:", (h / k) - xOld)
	return [h, k]
}
// returns a FRACTION
function addFrac(...fracs) {
	return reduce(...fracs.reduce((frac1, frac2) => {
		if (Number.isFinite(frac1))
			return Number.isFinite(frac2) ? [frac1 + frac2, 1] : [frac1 * frac2[1] + frac2[0], frac2[1]]
		var [numerator1, denominator1] = frac1
		if (Number.isFinite(frac2))
			return [numerator1 + frac2 * denominator1, denominator1]
		var [numerator2, denominator2] = frac2
		if (denominator1 == denominator2)
			return reduce(numerator1 + numerator2, denominator1)
		var gcdD = gcd(denominator1, denominator2), ratio1 = denominator1 / gcdD, ratio2 = denominator2 / gcdD
		return [numerator1 * ratio2 + numerator2 * ratio1, ratio1 * ratio2 * gcdD]
	}))
}
// returns a FRACTION
function subFrac(...fracs) {
	return reduce(...fracs.reduce((frac1, frac2) => {
		if (Number.isFinite(frac1))
			return Number.isFinite(frac2) ? [frac1 - frac2, 1] : [frac1 * frac2[1] - frac2[0], frac2[1]]
		var [numerator1, denominator1] = frac1
		if (Number.isFinite(frac2))
			return [numerator1 - frac2 * denominator1, denominator1]
		var [numerator2, denominator2] = frac2
		if (denominator1 == denominator2)
			return reduce(numerator1 - numerator2, denominator1)
		var gcdD = gcd(denominator1, denominator2), ratio1 = denominator1 / gcdD, ratio2 = denominator2 / gcdD
		return [numerator1 * ratio2 - numerator2 * ratio1, ratio1 * ratio2 * gcdD]
	}))
}
// returns a FRACTION
function mulFrac(...fracs) {
	return fracs.reduce((frac1, frac2) => {
		if (Number.isFinite(frac1))
			return reduce(frac1 * frac2[0], frac2[1])
		if (Number.isFinite(frac2))
			return reduce(frac1[0] * frac2, frac1[1])
		return reduce(frac1[0] * frac2[0], frac1[1] * frac2[1])
	})
}
// returns a FRACTION
function divFrac(dividend, divisor) {
	if (Number.isFinite(dividend))
		return reduce(dividend * divisor[1], divisor[0])
	if (Number.isFinite(divisor))
		return reduce(dividend[0], dividend[1] * divisor)
	return reduce(dividend[0] * divisor[1], dividend[1] * divisor[0])
}
// returns a FRACTION
function reciprocal([n, d]) {
	return [d, n]
}
// returns a FRACTION
function negate([n, d]) {
	return d < 0 ? [n, -d] : [-n, d]
}
function abs(frac) {
	return (frac[0] < 0) !== (frac[1] < 0) ? [-frac[0], frac[1]] : frac
}
function toDecimalString([n, d]) {
	return truncate(n / d)
}
function isInteger(frac) {
	return Number.isInteger(frac) || !(frac[0] % frac[1])
}
function fancyFraction(numerator, denominator) { // stylizes a FRACTION
	if (denominator == 1 || numerator == 0)
		return numerator
	if (denominator == -1)
		return -numerator
	var negative = false
	if (numerator < 0) {
		negative = denominator > 0
		numerator = -numerator
	}
	if (denominator < 0) {
		negative = numerator > 0
		denominator = -denominator
	}
	return fraction(numerator, denominator, negative ? "&minus;" : "")
}
function fraction(numerator, denominator, left = "") {
	return left + `<span class="frac"><sup>${numerator}</sup><span>&frasl;</span><sub>${denominator}</sub></span>`
}
function fractionCoefficient(frac, variable) {
	var numerator, denominator
	if (Number.isFinite(frac)) {
		numerator = frac
		denominator = 1
	} else
		[numerator, denominator] = frac
	if (numerator == 0)
		return "";
	if (denominator == 1) {
		if (numerator == 1)
			return variable
		if (numerator == -1)
			return "&minus;" + variable
		return numerator + variable
	}
	var negative = false
	if (numerator < 0) {
		negative = denominator > 0
		numerator = -numerator
	}
	if (denominator < 0) {
		negative = numerator > 0
		denominator = -denominator
	}
	return fraction(numerator, denominator, negative ? "&minus;" : "") + variable
}
function truncate(x) { // truncates numbers to 14 digits
	var str = x.toString()
	return str.length > 12 ? str.substring(0, 12) + "..." : str
}
function sqrtFracString(radicand, coeff, imaginary, denominator) {
	if (coeff == 1) coeff = ""
	if (imaginary) coeff += "<var>i</var>"
	return fancyFraction(sqrtText(radicand, coeff), denominator)
}
function withImaginary(number, imaginary) {
	return imaginary ?
		(number == 1 ?
			"<var>i</var>" :
			(number == -1 ?
				"-" :
				(Number.isFinite(number) ?
					+number.toFixed(12) :
					number)
			) + "<var>i</var>"
		) : number
}
// return a string that can be parsed by parseFraction to get the same input
// assumes that denominator is positive, and that the fraction is already reduced
function simpleFracText(numerator, denominator) {
	if (denominator == 1)
		return numerator
	return numerator + "/" + denominator
}