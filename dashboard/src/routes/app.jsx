import SkyBot from 'views/SkyBot/SkyBot';
import SolarSystems from 'views/SolarSystems/SolarSystems';
import FilterObject from 'views/FilterObject/FilterObject';
import GetPointings from 'views/GetPointings/GetPointings';
import ExposureDownload from 'views/ExposureDownload/ExposureDownload';

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
    path: '/getpointings',
    name: 'Get Pointings',
    icon: 'pe-7s-target',
    component: GetPointings,
  },
  {
    path: '/solarsystems',
    name: 'Solar Systems',
    icon: 'pe-7s-sun',
    component: SolarSystems,
  },
  { path: '/skybot', name: 'SkyBoT', icon: 'pe-7s-science', component: SkyBot },
  {
    path: '/filterobject',
    name: 'Filter Objects',
    icon: 'pe-7s-filter',
    component: FilterObject,
  },
  {
    path: '/exposuredownload',
    name: 'Exposure Download',
    icon: 'pe-7s-download',
    component: ExposureDownload,
  },

  // { path: "/user", name: "User Profile", icon: "pe-7s-user", component: UserProfile },
  // { path: "/table", name: "Table List", icon: "pe-7s-note2", component: TableList },
  // { path: "/typography", name: "Typography", icon: "pe-7s-news-paper", component: Typography },
  // { path: "/icons", name: "Icons", icon: "pe-7s-science", component: Icons },
  // { path: "/notifications", name: "Notifications", icon: "pe-7s-bell", component: Notifications },
  // { redirect: true, path:"/", to:"/dashboard", name: "Dashboard" }
];

export default appRoutes;
