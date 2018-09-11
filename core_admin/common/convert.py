import math


def sextodec(xyz, delimiter=None):
    """Decimal value from numbers in sexagesimal system.

   The input value can be either a floating point number or a string
   such as "hh mm ss.ss" or "dd mm ss.ss". Delimiters other than " "
   can be specified using the keyword ``delimiter``.
   """
    divisors = [1, 60.0, 3600.0]

    xyzlist = str(xyz).split(delimiter)

    sign = 1

    if "-" in xyzlist[0]:
        sign = -1

    xyzlist = [abs(float(x)) for x in xyzlist]

    decimal_value = 0

    for i, j in zip(xyzlist, divisors):  # if xyzlist has <3 values then
        # divisors gets clipped.
        decimal_value += i / j

    decimal_value = -decimal_value if sign == -1 else decimal_value

    return decimal_value


def dectosex(deci, precision=0.1, noPlus=False):
    """Converts decimal number into sexagesimal number parts.

   ``deci`` is the decimal number to be converted. ``precision`` is how
   close the multiple of 60 and 3600, for example minutes and seconds,
   are to 60.0 before they are rounded to the higher quantity, for
   example hours and minutes.
   """
    sign = "+"  # simple putting sign back at end gives errors for small
    # deg. This is because -00 is 00 and hence ``format``,
    # that constructs the delimited string will not add '-'
    # sign. So, carry it as a character.

    if noPlus:
        sign = ""

    if deci < 0:
        deci = abs(deci)
        sign = "-"

    frac1, num = math.modf(deci)
    num = int(num)  # hours/degrees is integer valued but type is float
    frac2, frac1 = math.modf(frac1 * 60.0)
    frac1 = int(frac1)  # minutes is integer valued but type is float
    frac2 *= 60.0  # number of seconds between 0 and 60

    # Keep seconds and minutes in [0 - 60.0000)
    if abs(frac2 - 60.0) < precision:
        frac2 = 0.0
        frac1 += 1
    if abs(frac1 - 60.0) < precision:
        frac1 = 0.0
        num += 1

    sex = ':'.join(["%02d" % num, "%02d" % frac1, "%02d" % frac2])

    return sign + sex

