--select ra, ra_error, "dec", dec_error, ref_epoch, parallax, parallax_error, pmra, pmra_error, pmdec, pmdec_error, phot_g_mean_flux, phot_g_mean_flux_error, phot_g_mean_mag, phot_bp_mean_flux, phot_bp_mean_flux_error, phot_rp_mean_flux, phot_rp_mean_flux_error, phot_rp_mean_mag, radial_velocity, radial_velocity_error, astrometric_excess_noise, astrometric_excess_noise_sig  from gaia.gaia_dr2 limit 1

--select * from gaia.gaia_dr2 where q3c_poly_query(ra, dec, '{0,0,2,0,2,1,0,1}') limit 1

select * from gaia.gaia_dr2 limit 1
--
--select * from gaia.gaia_dr2 where q3c_radial_query(ra, dec, 273.5835512525859, -26.13949672201504, 0.001 ) limit 1


select ra, "dec" from y1a1_coadd_stripe82.coadd_objects limit 10

select * from y1a1_coadd_stripe82.coadd_objects where q3c_radial_query(ra, "dec", 317.490884, -1.762072 , 0.005 );

