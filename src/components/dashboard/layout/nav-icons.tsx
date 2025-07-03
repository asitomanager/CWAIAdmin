import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { UserCircle as CandidateDetailsIcon } from "@phosphor-icons/react/dist/ssr/UserCircle"; // Candidate Details
import { UploadSimple as ProfileUploadIcon } from "@phosphor-icons/react/dist/ssr/UploadSimple"; // Profile Upload
import { FileText as JDQuestionBankIcon } from "@phosphor-icons/react/dist/ssr/FileText"; // JD & Question Bank Upload
import { Sliders as ConfigurationsIcon } from "@phosphor-icons/react/dist/ssr/Sliders"; // Configurations
import { UsersThree as UserManagementIcon } from "@phosphor-icons/react/dist/ssr/UsersThree"; // User Management

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
  "candidate-details": CandidateDetailsIcon,
  "profile-upload": ProfileUploadIcon,
  "jd-question-bank": JDQuestionBankIcon,
  configurations: ConfigurationsIcon,
  "user-management": UserManagementIcon,
} as Record<string, Icon>;
