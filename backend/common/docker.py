"""
    Funcoes para converter as estatisticas de um container,
    retiradas deste repositorio: https://github.com/TomasTomecek/sen/blob/master/sen/util.py#L162
"""

import functools
import logging
import os
import time
import traceback
from datetime import datetime

from docker.errors import APIError


# this is taken directly from docker client:
#   https://github.com/docker/docker/blob/28a7577a029780e4533faf3d057ec9f6c7a10948/api/client/stats.go#L309
def calculate_cpu_percent(d):
    cpu_count = len(d["cpu_stats"]["cpu_usage"]["percpu_usage"])
    cpu_percent = 0.0
    cpu_delta = float(d["cpu_stats"]["cpu_usage"]["total_usage"]) - float(
        d["precpu_stats"]["cpu_usage"]["total_usage"]
    )
    system_delta = float(d["cpu_stats"]["system_cpu_usage"]) - float(
        d["precpu_stats"]["system_cpu_usage"]
    )
    if system_delta > 0.0:
        cpu_percent = cpu_delta / system_delta * 100.0 * cpu_count
    return cpu_percent


# again taken directly from docker:
#   https://github.com/docker/cli/blob/2bfac7fcdafeafbd2f450abb6d1bb3106e4f3ccb/cli/command/container/stats_helpers.go#L168
# precpu_stats in 1.13+ is completely broken, doesn't contain any values
def calculate_cpu_percent2(d, previous_cpu, previous_system):
    # import json
    # du = json.dumps(d, indent=2)
    # logger.debug("XXX: %s", du)
    cpu_percent = 0.0
    cpu_total = float(d["cpu_stats"]["cpu_usage"]["total_usage"])
    cpu_delta = cpu_total - previous_cpu
    cpu_system = float(d["cpu_stats"]["system_cpu_usage"])
    system_delta = cpu_system - previous_system
    online_cpus = d["cpu_stats"].get(
        "online_cpus", len(d["cpu_stats"]["cpu_usage"]["percpu_usage"])
    )
    if system_delta > 0.0:
        cpu_percent = (cpu_delta / system_delta) * online_cpus * 100.0
    return cpu_percent, cpu_system, cpu_total


def calculate_blkio_bytes(d):
    """
    :param d:
    :return: (read_bytes, wrote_bytes), ints
    """
    bytes_stats = graceful_chain_get(d, "blkio_stats", "io_service_bytes_recursive")
    if not bytes_stats:
        return 0, 0
    r = 0
    w = 0
    for s in bytes_stats:
        if s["op"] == "Read":
            r += s["value"]
        elif s["op"] == "Write":
            w += s["value"]
    return r, w


def calculate_network_bytes(d):
    """
    :param d:
    :return: (received_bytes, transceived_bytes), ints
    """
    networks = graceful_chain_get(d, "networks")
    if not networks:
        return 0, 0
    r = 0
    t = 0
    for if_name, data in networks.items():
        r += data["rx_bytes"]
        t += data["tx_bytes"]
    return r, t


def graceful_chain_get(d, *args, default=None):
    t = d
    for a in args:
        try:
            t = t[a]
        except (KeyError, ValueError, TypeError, AttributeError):
            return default
    return t


def get_container_stats(container):
    """
    Retorna o status do container a cada segundo, igual ao comando docker stats
    Baseado neste:
        https://github.com/TomasTomecek/sen/blob/master/sen/docker_backend.py#L679
        https://github.com/TomasTomecek/sen/blob/master/sen/util.py#L158

    :param container: Uma instancia do container https://docker-py.readthedocs.io/en/stable/containers.html#container-objects
    :return: um Generator com as statisticas de uso do container.


    """
    cpu_total = 0.0
    cpu_system = 0.0
    cpu_percent = 0.0
    for x in container.stats(decode=True, stream=True):
        mem_current = x["memory_stats"]["usage"]
        mem_total = x["memory_stats"]["limit"]
        net_r, net_w = calculate_network_bytes(x)
        blk_read, blk_write = calculate_blkio_bytes(x)

        try:
            cpu_percent, cpu_system, cpu_total = calculate_cpu_percent2(
                x, cpu_total, cpu_system
            )
        except KeyError as e:
            cpu_percent = calculate_cpu_percent(x)

        r = {
            "read": x["read"],
            # "cpu_percent": cpu_percent,
            "cpu_percent": "{0:.2f}".format(cpu_percent),
            "mem_current": mem_current,
            "mem_total": x["memory_stats"]["limit"],
            "mem_percent": "{0:.2f}".format((mem_current / mem_total) * 100.0),
            # "mem_percent": (mem_current / mem_total) * 100.0,
            "blk_read": blk_read,
            "blk_write": blk_write,
            "net_rx": net_r,
            "net_tx": net_w,
        }

        yield r
