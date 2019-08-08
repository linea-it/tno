import SolarSystemsPanel from 'views/SolarSystems/SolarSystems';
import PointingsPanel from 'views/Pointings/Pointings';
import FilterPanel from 'views/FilterObject/Panel';
import CustomList from 'views/ObjectList/CustomList';
import ObjectList from 'views/ObjectList/ObjectList';
import Praia from 'views/Astrometry/Praia';
import RefineOrbitPanel from 'views/RefineOrbit/Panel';
import Placeholder from 'views/Placeholder';
import Dashboard from 'views/Dashboard/Dashboard';
import UserProfile from 'views/UserProfile/UserProfile';
import TableList from 'views/TableList/TableList';
import Typography from 'views/Typography/Typography';
import Icons from 'views/Icons/Icons';
import Notifications from 'views/Notifications/Notifications';
import SkybotDetail from '../views/SolarSystems/SkybotDetail';
import PointingsDetail from '../views/Pointings/PointingsDetail';
import RefineRunOrbitDetail from '../views/RefineOrbit/RunDetail';
import AsteroidDetail from '../views/RefineOrbit/AsteroidDetail';
import PredictionPanel from '../views/Prediction/Panel';
import PredictionDetail from '../views/Prediction/Detail';
import OccultationsPanel from '../views/Occultations/Panel';
import OccultationDetail from '../views/Occultations/Detail';
import AsteroidDetailPrediction from '../views/Prediction/AsteroidDetail';
import SkybotRun from '../views/SolarSystems/SkybotRun/SkybotRun';
import SkybotRunDetail from '../views/SolarSystems/SkybotRun/Detail';
import ExposureDetail from '../views/SolarSystems/SkybotRun/ExposureDetail';
import PraiaDetail from '../views/Astrometry/RunDetail';
import AsteroidRunDetail from '../views/Astrometry/AsteroidRunDetail';
import ReadCSV from '../views/Astrometry/ReadCSV';
import RunDetailInfo from '../views/Astrometry/RunDetailInfo'


const appRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'fa fa-home',
    component: Dashboard,
    //helpText: '',
  },
  {
    path: '/registration',
    name: 'Registration',
    icon: '',
    component: Placeholder,
    // helpText: '',
  },
  {
    path: '/pointings',
    name: 'Pointings',
    // icon: 'pe-7s-target',
    component: PointingsPanel,
    helpText:
      'Query the database and download the metadata telling, among others, pointing coordinates, date of observation, exposure time, band, and image location in database',
  },
  {
    path: '/solarsystem',
    name: 'Search SSSO',
    // icon: 'pe-7s-sun',
    component: SolarSystemsPanel,
    helpText:
      'Identification of small solar system objects (SSSO) in all pointings using the SkyBoT service.',
  },

  {
    path: '/skybotrun',
    name: 'Skybot Run',
    component: SkybotRun,
  },
  {
    path: '/skybotrun_detail/:id',
    name: 'Skybot Run Detail',
    component: SkybotRunDetail,
    hidden: true,
  },
  {
    path: '/skybotrun_exposure/:skybotrun/:expnum',
    name: 'Skybot Run Exposure Detail',
    component: ExposureDetail,
    hidden: true,
  },

  // { path: '/skybot', name: 'SkyBoT', icon: 'pe-7s-science', component: SkyBot },
  {
    path: '/filterobject',
    name: 'Filter Objects',
    // icon: 'pe-7s-filter',
    component: FilterPanel,
    // helpText: 'Download of images which have observations of specific objects.',
  },
  {
    path: '/custom_list',
    name: 'Custom Lists',
    // icon: 'fa fa-list',
    hidden: true,
    component: CustomList,
    helpText: 'texto6',
  },
  {
    path: '/objects/:id',
    name: 'Objects',
    hidden: true,
    component: ObjectList,
  },
  {
    path: '/skybotdetail/:id',
    name: 'Skybot Details',
    hidden: true,
    component: SkybotDetail,
  },
  {
    path: '/pointingsdetail/:id',
    name: 'Pointings Details',
    hidden: true,
    component: PointingsDetail,
  },
  {
    path: '/exposuredownload',
    name: 'Download',
    component: Placeholder,
    helpText: 'Download of images which have observations of specific objects.',
    hidden: true,
  },
  {
    path: '/astrometry',
    name: 'Astrometry',
    component: Praia,
    helpText:
      'Astrometric reduction using PRAIA package and stellar catalogue Gaia like reference to detect and determine positions of objects from CCD frame.',
  },
  {
    path: '/orbit_run_detail/:id',
    name: 'Refine Orbit Detail',
    component: RefineRunOrbitDetail,
    hidden: true,
  },
  {
    path: '/astrometry_run/:id',
    name: 'Astrometry Run',
    hidden: true,
    component: PraiaDetail,
  },

  {
    path: '/asteroid_run_detail/:id',
    name: 'Asteroid Astrometry Run',
    hidden: true,
    component: AsteroidRunDetail,
  },

  {
    path: '/refine_orbit',
    name: 'Refine Orbit',
    component: RefineOrbitPanel,
    helpText: 'Refinement of Orbits of specifics objects using NIMA code',
  },
  {
    path: '/refined_asteroid/:id',
    name: 'Refined Asteroid',
    hidden: true,
    component: AsteroidDetail,
  },
  {
    path: '/prediction',
    name: 'Prediction of Occultations',
    component: PredictionPanel,
    helpText:
      'Comparison of objects’ ephemeris and positions of stars to predict events of stellar occultation using Gaia catalogue like reference',
  },
  {
    path: '/prediction_detail/:id',
    name: 'Prediction Occultation Detail',
    component: PredictionDetail,
    hidden: true,
  },
  {
    path: '/predict_asteroid/:id',
    name: 'Prediction Occultation Detail',
    component: AsteroidDetailPrediction,
    hidden: true,
  },
  {
    path: '/occultations',
    name: 'Occultations',
    component: OccultationsPanel,
  },
  {
    path: '/occultation_detail/:id',
    name: 'Occultation Detail',
    hidden: true,
    component: OccultationDetail,
  },
  {
    path: '/light_curve',
    name: 'Light Curve Analysis',
    component: Placeholder,
  },
  {
    path: '/user',
    name: 'User Profile',
    icon: 'pe-7s-user',
    component: UserProfile,
    hidden: true,
  },
  {
    path: '/table',
    name: 'Table List',
    icon: 'pe-7s-note2',
    component: TableList,
    hidden: true,
  },
  {
    path: '/typography',
    name: 'Typography',
    icon: 'pe-7s-news-paper',
    component: Typography,
    hidden: true,
  },
  {
    path: '/icons',
    name: 'Icons',
    icon: 'pe-7s-science',
    component: Icons,
    hidden: true,
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: 'pe-7s-bell',
    component: Notifications,
    hidden: true,
  },

  {
    path: '/astrometry_read_csv/:filepath/:filename/:title?',
    name: 'ReadCSV',
    icon: 'pe-7s-science',
    component: ReadCSV,
    hidden: true,
  },

  {
    path: '/astrometry_info',
    name: 'RunDetailInfo',
    icon: 'pe-7s-science',
    component: RunDetailInfo,
    hidden: true,
  },


  // {
  //   path: '/formik',
  //   name: 'Formik',
  //   component: FormikTeste,
  //   hidden: false,
  // },
  { redirect: true, path: '/', to: '/dashboard', name: 'Dashboard' },
];

export default appRoutes;
