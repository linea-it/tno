import SolarSystemsPanel from 'views/SolarSystems/SolarSystems';
import PointingsPanel from 'views/Pointings/Pointings';
import FilterPanel from 'views/FilterObject/Panel';
import CustomList from 'views/ObjectList/CustomList';
import ObjectList from 'views/ObjectList/ObjectList';
import Praia from 'views/Astrometry/Praia';
import RefineOrbitPanel from 'views/RefineOrbit/Panel';
import PraiaRun from 'views/Astrometry/PraiaRun';
import Placeholder from 'views/Placeholder';

import Dashboard from 'views/Dashboard/Dashboard';
import UserProfile from 'views/UserProfile/UserProfile';
import TableList from 'views/TableList/TableList';
import Typography from 'views/Typography/Typography';
import Icons from 'views/Icons/Icons';
import Notifications from 'views/Notifications/Notifications';
import SkybotDetail from '../views/SolarSystems/SkybotDetail';
import PointingsDetail from '../views/Pointings/PointingsDetail';
import App from '../views/RefineOrbit/Details';


const appRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'fa fa-home',
    component: Dashboard,
    helpText: 'teste',
  },
  {
    path: '/registration',
    name: 'Registration',
    icon: '',
    component: Placeholder,
  },
  {
    path: '/pointings',
    name: 'Pointings',
    // icon: 'pe-7s-target',
    component: PointingsPanel,
  },
  {
    path: '/solarsystem',
    name: 'Search SSSO',
    // icon: 'pe-7s-sun',
    component: SolarSystemsPanel,
  },
  // { path: '/skybot', name: 'SkyBoT', icon: 'pe-7s-science', component: SkyBot },
  {
    path: '/filterobject',
    name: 'Filter Objects',
    // icon: 'pe-7s-filter',
    component: FilterPanel,
  },
  {
    path: '/custom_list',
    name: 'Custom Lists',
    // icon: 'fa fa-list',
    hidden: true,
    component: CustomList,
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
  },
  {
    path: '/astrometry',
    name: 'Astrometry',
    component: Praia,
  },
  {
    path: '/details',
    name: 'Details',
    component: App,
    hidden: true,
  },
  {
    path: '/astrometry_run/:id',
    name: 'Astrometry Run',
    hidden: true,
    component: PraiaRun,
  },
  {
    path: '/refine_orbit',
    name: 'Refine Orbit',
    component: RefineOrbitPanel,
  },
  {
    path: '/post_results',
    name: 'Post Results',
    component: Placeholder,
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
    hidden: false,
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: 'pe-7s-bell',
    component: Notifications,
    hidden: true,
  },
  { redirect: true, path: '/', to: '/dashboard', name: 'Dashboard' },
];

export default appRoutes;
