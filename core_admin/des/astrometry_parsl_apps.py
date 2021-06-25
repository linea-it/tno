from parsl import python_app


@python_app
def increment(x):
    return x + 1


def match_positions_jpl_des(raJPL, decJPL, raDES, decDES, radius=2):
    import numpy as np
    from astropy import units as u
    from astropy.coordinates import SkyCoord

    catJPL = SkyCoord(ra=[raJPL]*u.deg, dec=[decJPL]*u.deg, frame='icrs')
    catD00 = SkyCoord(ra=raDES*u.deg, dec=decDES*u.deg, frame='icrs')
    id1, d2d1, d3d = catD00.match_to_catalog_sky(catJPL)

    # search the index and value of element with minimal distance
    IDX_D00 = np.argmin(d2d1.arcsec)
    dmin = d2d1[IDX_D00].arcsec

    ra, dec, match_idx = None, None, None
    if dmin < radius:
        ra = raDES[IDX_D00]
        dec = decDES[IDX_D00]
        match_idx = IDX_D00

    return ra, dec, match_idx


@python_app
def proccess_ccd(name, ccd, current_path):
    import os
    import numpy as np
    from astropy.io import fits
    from des.astrometry_parsl_apps import match_positions_jpl_des
    from datetime import datetime, timezone

    t0 = datetime.now(timezone.utc)

    tp = dict({
        'stage': 'match_positions',
        'start': t0.isoformat(),
        'end': None,
        'exec_time': None,
        'ccd_id': ccd['id']
    })

    obs_coordinates = None

    try:
        # Coordenadas teroricas
        ra_jpl, dec_jpl = ccd['theoretical_coordinates']

        filepath = os.path.join(ccd['path'], ccd['filename'])

        # Le o catalogo Fits
        hdul = fits.open(filepath)
        rows = hdul[2].data

        a_ra_des = rows['ALPHA_J2000']
        a_dec_des = rows['DELTA_J2000']
        a_magpsf = rows['MAG_PSF']
        a_magerrpsf = rows['MAGERR_PSF']

        ra, dec, match_idx = match_positions_jpl_des(
            ra_jpl, dec_jpl, a_ra_des, a_dec_des, radius=2)

        if ra is not None and dec is not None:
            # Calcular "observed minus calculated"
            observed_omc = [float((ra-ra_jpl)*3600*1000),
                            float((dec-dec_jpl)*3600*1000)]

            ccd.update({
                'observed_coordinates': [float(ra), float(dec)],
                'observed_omc': observed_omc,
                'magpsf': float(a_magpsf[match_idx]),
                'magerrpsf': float(a_magerrpsf[match_idx])
            })

            # Cria um objeto com os dados da posição observada,
            # Esta etapa está aqui para aproveitar o paralelismo e adiantar a consolidação.
            obs_coordinates = dict({
                'name': name,
                'ccd_id': ccd['id'],
                'date_obs': ccd['date_obs'],
                'date_jd': ccd['date_jd'],
                'ra': ccd['observed_coordinates'][0],
                'dec': ccd['observed_coordinates'][1],
                'offset_ra': ccd['observed_omc'][0],
                'offset_dec': ccd['observed_omc'][1],
                'mag_psf': ccd['magpsf'],
                'mag_psf_err': ccd['magerrpsf'],
            })

        else:
            ccd.update({
                'observed_coordinates': None,
                'info': 'Could not find a position.'
            })

    except Exception as e:
        ccd.update({
            'observed_coordinates': None,
            'error': 'Failed in match position stage with exception: %s' % str(e)
        })

    finally:
        t1 = datetime.now(timezone.utc)
        tdelta = t1 - t0

        tp['end'] = t1.isoformat()
        tp['exec_time'] = tdelta.total_seconds()

        return (name, ccd, obs_coordinates, tp)
