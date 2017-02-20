'use strict'
/* This is a default multiplier whereby the score will be = (difficulty x multiplier)
 i.e. using these multipliers will create challenges with the following scores:
 *     =  100
 **    =  250
 ***   =  450
 ****  =  700
 ***** = 1000
 I think it is fair to assume that completing a 5* task will be 10 times harder than a 1* task.
 */
var multiplier = [ 100, 125, 150, 175, 200 ]
function calculateScore (difficulty) {
  return difficulty * multiplier[ difficulty - 1 ]
}
module.exports = calculateScore
