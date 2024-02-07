--select ra, ra_error, "dec", dec_error, ref_epoch, parallax, parallax_error, pmra, pmra_error, pmdec, pmdec_error, phot_g_mean_flux, phot_g_mean_flux_error, phot_g_mean_mag, phot_bp_mean_flux, phot_bp_mean_flux_error, phot_rp_mean_flux, phot_rp_mean_flux_error, phot_rp_mean_mag, radial_velocity, radial_velocity_error, astrometric_excess_noise, astrometric_excess_noise_sig  from gaia.gaia_dr2 limit 1

--select * from gaia.gaia_dr2 where q3c_poly_query(ra, dec, '{0,0,2,0,2,1,0,1}') limit 1


select * from gaia.gaia_dr2 limit 1


select * from gaia.gaia_dr2 where q3c_poly_query("ra", "dec", '{25.447951, -3.36042, 25.447641, -3.510105, 25.747496, -3.510276, 25.747698, -3.36045}');



SELECT * FROM gaia.gaia_dr2 WHERE q3c_poly_query("ra", "dec", '{41.869865, -4.630726, 41.870153, -4.780113, 42.169939, -4.780528, 42.169593, -4.63116}');


SELECT * FROM gaia.gaia_dr2 limit 1;

--select distinct(source_id), ra, "dec" from gaia.gaia_dr2
--	where q3c_radial_query(ra, dec, 30.415808749999997, 4.325122222222222, 0.1 )
--	or q3c_radial_query(ra, dec, 30.415805, 4.325123055555555, 0.1 )
--	or q3c_radial_query(ra, "dec", 30.411043749999997, 4.32621, 0.1 );
--
--
--select COUNT(*) from gaia.gaia_dr2 where q3c_radial_query(ra, "dec", 30.415808749999997, 4.325122222222222, 0.05 );
--select COUNT(*) from gaia.gaia_dr2 where q3c_radial_query(ra, "dec", 30.411043749999997, 4.32621, 0.05 );
--
--SELECT * FROM gaia.gaia_dr2 WHERE q3c_radial_query("ra", "dec", 30.415808749999997, 4.325122222222222, 0.5)
--
--
--select ra, "dec" from y1a1_coadd_stripe82.coadd_objects limit 10
--select * from y1a1_coadd_stripe82.coadd_objects where q3c_radial_query(ra, "dec", 317.490884, -1.762072 , 0.005 );
--
--
--select distinct(source_id), ra, "dec" from gaia.gaia_dr2
--	where q3c_radial_query(ra, dec, 30.415808749999997, 4.325122222222222, 0.1 )
--	or q3c_radial_query(ra, dec, 30.415805, 4.325123055555555, 0.1 )
--	or q3c_radial_query(ra, "dec", 30.411043749999997, 4.32621, 0.1 );
--
--
--select distinct(source_id), ra, "dec" from gaia.gaia_dr2
----select count(distinct(source_id)) from gaia.gaia_dr2
--	where q3c_radial_query(ra, dec, 30.41570042, 4.32503417, 0.1 )
--
--	30.41570042, 4.32503417
----	or q3c_radial_query(ra, dec, 30.45202833, 4.41841056, 0.1 )
----	or q3c_radial_query(ra, dec, 30.53556667, 4.47381611, 0.1 )
--
--
--
-- 30.41580875    4.32512222
-- 30.45202833    4.41841056
-- 30.53556667    4.47381611
--
--
