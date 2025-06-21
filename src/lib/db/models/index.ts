import Admin from './admin';
import Client from './client';
import Service from './service';
import ServiceCategory from './serviceCategory';
import Visit from './visit';
import User from './user';
import Reward from './reward';

export {
  Admin,
  Client,
  Service,
  ServiceCategory,
  Visit,
  User,
  Reward
};

export type { IAdmin } from './admin';
export type { IClient } from './client';
export type { IService } from './service';
export type { IServiceCategory } from './serviceCategory';
export type { IReward } from './reward';
export type { IVisit, ServiceReceived } from './visit'; 