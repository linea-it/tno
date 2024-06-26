import datetime
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

    sex = ":".join(["%02d" % num, "%02d" % frac1, "%02d" % frac2])

    return sign + sex


def datetime_to_julian_datetime(date):
    """
    Convert a datetime object into julian float.
    Args:
        date: datetime-object of date in question

    Returns: float - Julian calculated datetime.
    Raises:
        TypeError : Incorrect parameter type
        ValueError: Date out of range of equation
    """

    # Ensure correct format
    if not isinstance(date, datetime.datetime):
        raise TypeError('Invalid type for parameter "date" - expecting datetime')
    elif date.year < 1801 or date.year > 2099:
        raise ValueError("Datetime must be between year 1801 and 2099")

    # Perform the calculation
    julian_datetime = (
        367 * date.year
        - int((7 * (date.year + int((date.month + 9) / 12.0))) / 4.0)
        + int((275 * date.month) / 9.0)
        + date.day
        + 1721013.5
        + (date.hour + date.minute / 60.0 + date.second / math.pow(60, 2)) / 24.0
        - 0.5 * math.copysign(1, 100 * date.year + date.month - 190002.5)
        + 0.5
    )

    return julian_datetime
