from random import randint


def randbool(n=8):
    """Retorna um boolean randomicamente baseado na probalidade

    Args:
        n (int, optional): inverse of probability. Defaults to 5.

    Returns:
        bool:
    """
    return randint(0, n * n - 1) % n == 0
