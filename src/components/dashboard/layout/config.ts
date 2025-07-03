import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  //{ key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'admindashboard', title: 'Dashboard', href: paths.dashboard.admindashboard, icon: 'chart-pie' },
  //{ key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'candidates', title: 'Candidate Details', href: paths.dashboard.candidates, icon: 'candidate-details' },
  { key: 'bulkprofileupload', title: 'Profile Upload', href: paths.dashboard.bulkprofileupload, icon: 'profile-upload' },
  //{ key: 'questionbankupload', title: 'Question Bank Upload', href: paths.dashboard.questionbankupload, icon: 'user' },
  { key: 'jdupload', title: 'JD & Question Bank', href: paths.dashboard.jdupload, icon: 'jd-question-bank' },
  { key: 'createskilldesignation', title: 'Configurations', href: paths.dashboard.createskillanddesignation, icon: 'configurations' },
  //{ key: '', title: 'Change Password', href: "", icon: '',disabled:false },
  //{ key: 'createadmin', title: 'User Management', href: paths.dashboard.createadminuser, icon: 'user-management' },
  //{ key: 'resumeupload', title: 'Resume Upload', href: paths.dashboard.resumeupload, icon: 'user' },
  //{ key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  //{ key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  //{ key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  //{ key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
  //{ key: 'candidatedashboard', title: 'Candidate Dashboard', href: paths.dashboard.candidatedashboard, icon: 'user' },
] satisfies NavItemConfig[];
