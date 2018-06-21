import SolarSystems from 'views/SolarSystems/SolarSystems';
import Get from 'views/GetPointings/Get';
import FilterPanel from 'views/FilterObject/Panel';
import CustomList from 'views/ObjectList/CustomList';
import ObjectList from 'views/ObjectList/ObjectList';
import Praia from 'views/Astrometry/Praia';

import Dashboard from 'views/Dashboard/Dashboard';
import UserProfile from 'views/UserProfile/UserProfile';
import TableList from 'views/TableList/TableList';
import Typography from 'views/Typography/Typography';
import Icons from 'views/Icons/Icons';
import Notifications from 'views/Notifications/Notifications';


const appRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'fa fa-home',
    component: Dashboard,
  },
  {
    path: '/registration',
    name: 'Registration',
    icon: '',
    component: SolarSystems,
  },
  {
    path: '/getpointings',
    name: 'GetPointings',
    // icon: 'pe-7s-target',
    component: Get,
  },
  {
    path: '/solarsystems',
    name: 'Search SSSO',
    // icon: 'pe-7s-sun',
    component: SolarSystems,
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
    path: '/exposuredownload',
    name: 'Download',
    // icon: 'pe-7s-download',
    component: SolarSystems,
  },
  {
    path: '/astrometry',
    name: 'Astrometry',
    // icon: 'pe-7s-download',
    component: Praia,
  },
  {
    path: '/refine_orbit',
    name: 'Refine Orbit',
    // icon: 'pe-7s-download',
    component: SolarSystems,
  },
  {
    path: '/post_results',
    name: 'Post Results',
    // icon: 'pe-7s-download',
    component: SolarSystems,
  },
  {
    path: '/light_curve',
    name: 'Light Curve Analysis',
    // icon: 'pe-7s-download',
    component: SolarSystems,
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
  { redirect: true, path: '/', to: '/dashboard', name: 'Dashboard' },
];

export default appRoutes;
