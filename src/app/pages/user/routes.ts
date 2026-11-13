import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { AppPages } from './app-pages/app-pages';
import { TableOrderMenu } from './table-order-menu/table-order-menu';
import { RestaurantRegisterRequest } from './self-register/restaurant-register-request/restaurant-register-request';
import { DeliverymanRegisterRequest } from './self-register/deliveryman-register-request/deliveryman-register-request';
import { LocalservicesRegisterRequest } from './self-register/localservices-register-request/localservices-register-request';
import { RealestateRegisterRequest } from './self-register/realestate-register-request/realestate-register-request';
import { DairyRegisterRequest } from './self-register/dairy-register-request/dairy-register-request';
import { JhatkaRegisterRequest } from './self-register/jhatka-register-request/jhatka-register-request';
import { StoresRegisterRequest } from './self-register/stores-register-request/stores-register-request';
import { RegisterRequestSaved } from './self-register/register-request-saved/register-request-saved';
import { HelpSupportForm } from './help-support-form/help-support-form';
import { ContactUsForm } from './contact-us-form/contact-us-form';

export const UserRoutes: Routes = [
  {
    path: '',
    component: Landing,
    data: {
      title: 'home'
    }
  },
  {
    path: 'pages/:id',
    component: AppPages,
    data: {
      title: 'home'
    }
  },
  {
    path: 'table-order/:vendor/:id',
    component: TableOrderMenu,
    data: {
      title: 'table_order'
    }
  },
  {
    path: 'restaurant-register-request',
    component: RestaurantRegisterRequest,
    data: {
      title: 'restaurant_register_request'
    }
  },
  {
    path: 'deliveryman-register-request',
    component: DeliverymanRegisterRequest,
    data: {
      title: 'deliveryman_register_request'
    }
  },
  {
    path: 'localservices-register-request',
    component: LocalservicesRegisterRequest,
    data: {
      title: 'localservices_register_request'
    }
  },
  {
    path: 'realestate-register-request',
    component: RealestateRegisterRequest,
    data: {
      title: 'realestate_register_request'
    }
  },
  {
    path: 'dairy-register-request',
    component: DairyRegisterRequest,
    data: {
      title: 'dairy_register_request'
    }
  },
  {
    path: 'jhatka-register-request',
    component: JhatkaRegisterRequest,
    data: {
      title: 'jhatka_register_request'
    }
  },
  {
    path: 'stores-register-request',
    component: StoresRegisterRequest,
    data: {
      title: 'stores_register_request'
    }
  },
  {
    path: 'register-request-saved',
    component: RegisterRequestSaved,
    data: {
      title: 'register_request_saved',
    }
  },
  {
    path: 'help-support',
    component: HelpSupportForm,
    data: {
      title: 'help_and_support'
    }
  },
  {
    path: 'contact-us',
    component: ContactUsForm,
    data: {
      title: 'contact_us'
    }
  }
];
