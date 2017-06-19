// Shamelessly taken from https://github.com/sindresorhus/leven

/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

let arr = []
let charCodeCache = []

module.exports = function findLevenshtein(a, b) {
  if (a === b) {
    return 0
  }

  let swap = a

  // Swapping the strings if `a` is longer than `b` so we know which one
  // is the shortest & which one is the longest
  if (a.length > b.length) {
    a = b
    b = swap
  }

  let aLen = a.length
  let bLen = b.length

  // Performing suffix trimming
  // We can linearly drop suffix common to both strings since they
  // don't increase distance at all
  while (aLen > 0 && (a.charCodeAt(aLen - 1) === b.charCodeAt(bLen - 1))) {
    aLen--
    bLen--
  }

  // Performing prefix trimming
  // We can linearly drop prefix common to both strings since they
  // don't increase distance at all
  let start = 0

  while (start < aLen && (a.charCodeAt(start) === b.charCodeAt(start))) {
    start++
  }

  aLen -= start
  bLen -= start

  if (aLen === 0) {
    return bLen
  }

  let i = 0
  let j = 0
  let bCharCode, result, tmp, tmp2

  while (i < aLen) {
    charCodeCache[i] = a.charCodeAt(start + i)
    arr[i] = ++i
  }

  while (j < bLen) {
    bCharCode = b.charCodeAt(start + j)
    tmp = j++
    result = j

    for (i = 0; i < aLen; i++) {
      tmp2 = (bCharCode === charCodeCache[i]) ? tmp : tmp + 1
      tmp = arr[i]

      if (tmp > result && tmp2 > result) {
        result = result + 1
      } else if (tmp2 > tmp) {
        result = tmp + 1
      } else {
        result = tmp2
      }

      arr[i] = result
    }
  }

  return result
}
