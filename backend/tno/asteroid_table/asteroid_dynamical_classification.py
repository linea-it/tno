import numpy as np


class SkyBot:
    """
    Class representing a celestial object classifier.

    This class provides static methods to classify celestial objects based on their semi-major axis and eccentricity
    as done by Skybot. Check https://ssp.imcce.fr/webservices/skybot/

    Methods:
    - vulcanoid(a): Check if an object's semi-major axis is within the range for a Vulcanoid.
    - nea_atira(a, e): Check if an object's semi-major axis and eccentricity qualify as an Atira Near-Earth Asteroid.
    - nea_aten(a, e): Check if an object's semi-major axis and eccentricity qualify as an Aten Near-Earth Asteroid.
    - nea_apollo(a, e): Check if an object's semi-major axis and eccentricity qualify as an Apollo Near-Earth Asteroid.
    - nea_amor(a, e): Check if an object's semi-major axis and eccentricity qualify as an Amor Near-Earth Asteroid.
    - marscrosser_deep(a, e): Check if an object's semi-major axis and eccentricity qualify as a Mars-crosser (deep).
    - marscrosser_shallow(a, e): Check if an object's semi-major axis and eccentricity qualify as a Mars-crosser (shallow).
    - hungaria(a, e): Check if an object's semi-major axis and eccentricity qualify as a Hungaria asteroid.
    - mb_inner(a): Check if an object's semi-major axis is within the range for an Inner Main-belt asteroid.
    - mb_middle(a): Check if an object's semi-major axis is within the range for a Middle Main-belt asteroid.
    - mb_outer(a): Check if an object's semi-major axis is within the range for an Outer Main-belt asteroid.
    - mb_cybele(a): Check if an object's semi-major axis is within the range for a Cybele Main-belt asteroid.
    - mb_hilda(a): Check if an object's semi-major axis is within the range for a Hilda Main-belt asteroid.
    - trojan(a): Check if an object's semi-major axis is within the range for a Trojan asteroid.
    - centaur(a): Check if an object's semi-major axis is within the range for a Centaur.
    - kbo_classical(a): Check if an object's semi-major axis is within the range for a Classical Kuiper Belt Object.
    - kbo_detached(a, e): Check if an object's semi-major axis and eccentricity qualify as a Detached Kuiper Belt Object.
    - kbo_sdo(a, e): Check if an object's semi-major axis and eccentricity qualify as a Scattered Disk Object.
    - kbo_classical_inner(a): Check if an object's semi-major axis is within the inner range for a Classical Kuiper Belt Object.
    - kbo_classical_main(a): Check if an object's semi-major axis is within the main range for a Classical Kuiper Belt Object.
    - kbo_classical_outer(a): Check if an object's semi-major axis is within the outer range for a Classical Kuiper Belt Object.
    - ioc(a): Check if an object's semi-major axis qualifies as an Inner Oort Cloud object.
    """

    @staticmethod
    def vulcanoid(a):
        """Check if an object's semi-major axis is within the range for a Vulcanoid."""
        return 0.08 <= a < 0.21

    @staticmethod
    def nea_atira(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as an Atira Near-Earth Asteroid."""
        return (0.21 <= a < 1.0) and (a * (1 + e) < 0.983)

    @staticmethod
    def nea_aten(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as an Aten Near-Earth Asteroid."""
        return (0.21 <= a < 1.0) and (a * (1 + e) >= 0.983)

    @staticmethod
    def nea_apollo(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as an Apollo Near-Earth Asteroid."""
        return (1.0 < a < 2.0) and (a * (1 - e) < 1.017)

    @staticmethod
    def nea_amor(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as an Amor Near-Earth Asteroid."""
        return (1.0 < a < 2.0) and (1.017 <= a * (1 - e) < 1.3)

    @staticmethod
    def marscrosser_deep(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as a Mars-crosser (deep)."""
        return (1.0 < a < 2.0) and (1.3 <= a * (1 - e) < 1.58)

    @staticmethod
    def marscrosser_shallow(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as a Mars-crosser (shallow)."""
        return (1.0 < a < 2.0) and (1.58 <= a * (1 - e) <= 1.666)

    @staticmethod
    def hungaria(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as a Hungaria asteroid."""
        return (1.0 < a < 2.0) and (a * (1 - e) > 1.666)

    @staticmethod
    def mb_inner(a):
        """Check if an object's semi-major axis is within the range for an Inner Main-belt asteroid."""
        return 2.0 <= a < 2.5

    @staticmethod
    def mb_middle(a):
        """Check if an object's semi-major axis is within the range for a Middle Main-belt asteroid."""
        return 2.5 <= a < 2.82

    @staticmethod
    def mb_outer(a):
        """Check if an object's semi-major axis is within the range for an Outer Main-belt asteroid."""
        return 2.82 <= a < 3.27

    @staticmethod
    def mb_cybele(a):
        """Check if an object's semi-major axis is within the range for a Cybele Main-belt asteroid."""
        return 3.27 <= a < 3.7

    @staticmethod
    def mb_hilda(a):
        """Check if an object's semi-major axis is within the range for a Hilda Main-belt asteroid."""
        return 3.7 <= a < 4.6

    @staticmethod
    def trojan(a):
        """Check if an object's semi-major axis is within the range for a Trojan asteroid."""
        return 4.6 <= a < 5.5

    @staticmethod
    def centaur(a):
        """Check if an object's semi-major axis is within the range for a Centaur."""
        return 5.5 <= a < 30.1

    @staticmethod
    def kbo_classical(a):
        """Check if an object's semi-major axis is within the range for a Classical Kuiper Belt Object."""
        return 30.1 <= a < 2000.0

    @staticmethod
    def kbo_detached(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as a Detached Kuiper Belt Object."""
        return (30.1 <= a < 2000.0) and (e >= 0.24)

    @staticmethod
    def kbo_sdo(a, e):
        """Check if an object's semi-major axis and eccentricity qualify as a Scattered Disk Object."""
        return (30.1 <= a < 2000.0) and (
            a * (1 - e) <= 30.1 * (2 ** (2 / 3)) * (1 - 0.24)
        )

    @staticmethod
    def kbo_classical_inner(a):
        """Check if an object's semi-major axis is within the inner range for a Classical Kuiper Belt Object."""
        return 30.1 <= a < 39.4

    @staticmethod
    def kbo_classical_main(a):
        """Check if an object's semi-major axis is within the main range for a Classical Kuiper Belt Object."""
        return 39.4 <= a < 47.8

    @staticmethod
    def kbo_classical_outer(a):
        """Check if an object's semi-major axis is within the outer range for a Classical Kuiper Belt Object."""
        return 47.8 <= a < 2000.0

    @staticmethod
    def ioc(a):
        """Check if an object's semi-major axis qualifies as an Inner Oort Cloud object."""
        return a >= 2000.0


class AstOrb:
    """
    Class representing a celestial object classifier.

    Provides static methods to classify celestial objects based on parameters from the astorb database at Lowell Observatory.
    Check paper https://doi.org/10.1016/j.ascom.2022.100661

    Parameters:
    - a (float): Semi-major axis.
    - e (float): Eccentricity.
    - i (float): Inclination.
    - q (float): Perihelion distance.
    - Q (float): Aphelion distance.
    - pha (int): Flag indicating if the object is a Potentially Hazardous Asteroid.

    Baseclasses:
    - "NEO": Near-Earth Object
    - "MBA": Main Belt Asteroid
    - "Mars Crosser": Mars Crosser
    - "Jovian Trojan": Jovian Trojan
    - "Jupiter Crossers": Jupiter Crossers
    - "Damocloid": Damocloid
    - "Centaur": Centaur
    - "TNO": Trans Neptunian Object
    - "IOC": Inner Oort Cloud

    Methods:
    - neo(q): Check if an object's perihelion distance is within the range for a Near-Earth Object.
    - neo_apollo(a, q): Check if an object is a NEO Apollo.
    - neo_aten(a, q, Q): Check if an object is a NEO Aten.
    - neo_amor(a, q): Check if an object is a NEO Amor.
    - neo_atira(a, q, Q): Check if an object is a NEO Atira.
    - neo_pha(pha): Check if an object is a Potentially Hazardous Asteroid.
    - mars_crosser(q): Check if an object is a Mars Crosser.
    - main_belt_asteroid(a, q): Check if an object is a Main Belt Asteroid.
    - mba_inner_belt(a, q): Check if an MBA is in the inner belt.
    - mba_middle_belt(a, q): Check if an MBA is in the middle belt.
    - mba_outer_belt(a, q): Check if an MBA is in the outer belt.
    - mba_hildas(a, q, e): Check if an MBA is a Hilda.
    - jovian_trojan(a, e): Check if an object is a Jovian Trojan.
    - jupiter_crosser(a, e): Check if an object is a Jupiter Crosser.
    - damocloid(a, i, e): Check if an object is a Damocloid.
    - centaur(a): Check if an object is a Centaur.
    - tno(a): Check if an object is a Trans Neptunian Object.
    - tno_cold_classical(i, q, a): Check if a TNO is a Cold Classical TNO.
    - tno_hot_classical(i, q, a): Check if a TNO is a Hot Classical TNO.
    - tno_sdo(e, q, a): Check if a TNO is an SDO TNO.
    - tno_detached(e, q, a): Check if a TNO is a Detached TNO.
    """

    @staticmethod
    def neo(q):
        """Check if an object's perihelion distance is within the range for a NEO."""
        return q < 1.3

    @staticmethod
    def neo_apollo(a, q):
        """Check if an object is a NEO Apollo."""
        return (a >= 1.0) and (q <= 1.017)

    @staticmethod
    def neo_aten(a, q, Q):
        """Check if an object is a NEO Aten."""
        return (a < 1.0) and (q < 1.3) and (Q > 0.983)

    @staticmethod
    def neo_amor(a, q):
        """Check if an object is a NEO Amor."""
        return (a > 1.0) and (1.017 <= q < 1.3)

    @staticmethod
    def neo_atira(a, q, Q):
        """Check if an object is a NEO Atira."""
        return (a < 1.0) and (q < 1.3) and (Q < 0.983)

    @staticmethod
    def neo_pha(pha):
        """Check if an object is a Potentially Hazardous Asteroid."""
        return pha

    @staticmethod
    def mars_crosser(q):
        """Check if an object is a Mars Crosser."""
        return 1.3 <= q <= 1.666

    @staticmethod
    def main_belt_asteroid(a, q):
        """Check if an object is a Main Belt Asteroid."""
        return (a < 4.8) and (q > 1.666)

    @staticmethod
    def mba_inner_belt(a, q):
        """Check if an MBA is in the inner belt."""
        return (2.0 <= a <= 2.5) and (q > 1.666)

    @staticmethod
    def mba_middle_belt(a, q):
        """Check if an MBA is in the middle belt."""
        return (2.5 < a <= 2.82) and (q > 1.666)

    @staticmethod
    def mba_outer_belt(a, q, e):
        """Check if an MBA is in the outer belt."""
        # e is set here because of the subset of hildas
        # that must use e to be defines, but is a dummy
        # variable here
        return (2.82 < a < 4.8) and (q > 1.666)

    @staticmethod
    def mba_hildas(a, q, e):
        """Check if an MBA is a Hilda."""
        return (3.7 <= a <= 4.2) and (q > 1.666) and (e <= 0.3)

    @staticmethod
    def jovian_trojan(a, e):
        """Check if an object is a Jovian Trojan."""
        return (4.8 <= a <= 5.5) and (e <= 0.3)

    @staticmethod
    def jupiter_crosser(a, e):
        """Check if an object is a Jupiter Crosser."""
        return (4.8 <= a <= 5.5) and (e > 0.3)

    @staticmethod
    def damocloid(a, i, e):
        """Check if an object is a Damocloid."""
        return (
            (5.204267 / a)
            + (2 * np.cos(i * np.pi / 180.0) * np.sqrt((a / 5.204267) * (1 - e**2)))
        ) < 2.0

    @staticmethod
    def centaur(a):
        """Check if an object is a Centaur."""
        return 5.5 < a <= 30.0709

    @staticmethod
    def tno(a):
        """Check if an object is a Trans Neptunian Object."""
        return a > 30.0709

    @staticmethod
    def tno_cold_classical(i, q, a):
        """Check if a TNO is a Cold Classical TNO."""
        return ((i < 5.0) and (q >= 37) and (37 <= a <= 40)) or (
            (i < 5.0) and (q >= 38) and (42 <= a <= 48)
        )

    @staticmethod
    def tno_hot_classical(i, q, a):
        """Check if a TNO is a Hot Classical TNO."""
        return (i > 5.0) and (q >= 37) and (37 <= a <= 48)

    @staticmethod
    def tno_sdo(e, q, a):
        """Check if a TNO is an SDO TNO."""
        return (e > 0.4) and (25 <= q <= 35) and (a > 30.0709)

    @staticmethod
    def tno_detached(e, q, a):
        """Check if a TNO is a Detached TNO."""
        return (e > 0.25) and (q > 40) and (a > 30.0709)


def skybotClassification(a, e):
    """
    Classify celestial objects based on their semi-major axis (a) and eccentricity (e).

    Parameters:
    - a (float): Semi-major axis of the celestial object.
    - e (float): Eccentricity of the celestial object.

    Returns a list containing two strings:
    1. The dynamical base class.
    2. The dynamical subclass (or repeats baseclass if subclass does not exist).
    """

    if a < 2.0:
        # baseclass vulcanoid
        if SkyBot.vulcanoid(a):
            return ["Vulcanoid", "Vulcanoid"]

        # baseclass nea
        if SkyBot.nea_atira(a, e):
            return ["Near-Earth Asteroid", "NEA>Atira"]

        if SkyBot.nea_aten(a, e):
            return ["Near-Earth Asteroid", "NEA>Aten"]

        if SkyBot.nea_apollo(a, e):
            return ["Near-Earth Asteroid", "NEA>Apollo"]

        if SkyBot.nea_amor(a, e):
            return ["Near-Earth Asteroid", "NEA>Amor"]

        if SkyBot.marscrosser_deep(a, e):
            return ["Mars-Crosser", "Mars-Crosser>Deep"]

        if SkyBot.marscrosser_shallow(a, e):
            return ["Mars-Crosser", "Mars-Crosser>Shallow"]

        if SkyBot.hungaria(a, e):
            return ["Hungaria", "Hungaria"]

    if a < 4.6:
        if SkyBot.mb_inner(a):
            return ["Main Belt", "MB>Inner"]

        if SkyBot.mb_middle(a):
            return ["Main Belt", "MB>Middle"]

        if SkyBot.mb_outer(a):
            return ["Main Belt", "MB>Outer"]

        if SkyBot.mb_cybele(a):
            return ["Main Belt", "MB>Cybele"]

        if SkyBot.mb_hilda(a):
            return ["Main Belt", "MB>Hilda"]

    if a >= 4.6:
        if SkyBot.trojan(a):
            return ["Trojan", "Trojan"]

        if SkyBot.centaur(a):
            return ["Centaur", "Centaur"]

        if SkyBot.kbo_sdo(a, e):
            return ["Kuiper Belt Object", "KBO>SDO"]

        if SkyBot.kbo_detached(a, e):
            return ["Kuiper Belt Object", "KBO>Detached"]

        if SkyBot.kbo_classical_inner(a):
            return ["Kuiper Belt Object", "KBO>Classical>Inner"]

        if SkyBot.kbo_classical_main(a):
            return ["Kuiper Belt Object", "KBO>Classical>Main"]

        if SkyBot.kbo_classical_outer(a):
            return ["Kuiper Belt Object", "KBO>Classical>Outer"]

        # commented because all of above subclasses contain the complete kbo > classical
        # if SkyBot.kbo_classical(a):
        #     return ["Kuiper Belt Object", "KBO > Classical"]

        if SkyBot.ioc(a):
            return ["Inner Oort Cloud", "Inner Oort Cloud"]

    return ["Unclassified", "Unclassified"]


def astorbClassification(a, e, i, q, Q, pha):

    if (q < 1.3) and not pha:

        if AstOrb.neo_apollo(a, q):
            return ["Near-Earth Object", "NEO > Apollo"]

        if AstOrb.neo_aten(a, q, Q):
            return ["Near-Earth Object", "NEO > Aten"]

        if AstOrb.neo_amor(a, q):
            return ["Near-Earth Object", "NEO > Amor"]

        if AstOrb.neo_atira(a, q, Q):
            return ["Near-Earth Object", "NEO > Atira"]

        # commented because the options above encompass all neos
        # if AstOrb.neo(q):
        #     return ["Near-Earth Object", "NEO"]
    else:
        if AstOrb.neo_pha(pha):
            return ["Near-Earth Object", "NEO > PHA"]

    if AstOrb.mars_crosser(q):
        return ["Mars Crosser", "Mars Crosser"]

    if (q > 1.666) and (a < 4.8):
        if AstOrb.mba_inner_belt(a, q):
            return ["Main Belt Asteroid", "MBA > Inner Belt"]

        if AstOrb.mba_middle_belt(a, q):
            return ["Main Belt Asteroid", "MBA > Middle Belt"]

        if AstOrb.mba_outer_belt(a, q, e):
            if AstOrb.mba_hildas(a, q, e):
                return ["Main Belt Asteroid", "MBA > Hildas"]
            else:
                return ["Main Belt Asteroid", "MBA > Outer Belt"]

        if AstOrb.main_belt_asteroid(a, q):
            return ["Main Belt Asteroid", "MBA"]

    if a >= 4.8:
        if AstOrb.jovian_trojan(a, e):
            return ["Jovian Trojan", "Jovian Trojan"]

        if AstOrb.jupiter_crosser(a, e):
            return ["Jupiter Crosser", "Jupiter Crosser"]

        if AstOrb.damocloid(a, i, e):
            return ["Damocloid", "Damocloid"]

        if AstOrb.centaur(a):
            return ["Centaur", "Centaur"]

    if a > 30.0709:
        if AstOrb.tno_cold_classical(i, q, a):
            return ["Trans Neptunian Object", "TNO > Cold Classical"]

        if AstOrb.tno_hot_classical(i, q, a):
            return ["Trans Neptunian Object", "TNO > Hot Classical"]

        if AstOrb.tno_sdo(e, q, a):
            return ["Trans Neptunian Object", "TNO > SDO"]

        if AstOrb.tno_detached(e, q, a):
            return ["Trans Neptunian Object", "TNO > Detached"]

        if AstOrb.tno(a):
            return ["Trans Neptunian Object", "TNO"]
