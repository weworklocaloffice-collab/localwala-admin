import { Injectable } from '@angular/core';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoadingDialog } from 'src/app/ui-components/loading-dialog/loading-dialog';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DummyListInterface } from '../interfaces/dummy.list.interface';
import { environment } from 'src/environments/environment';
import { PublicBusinssSettingInterface } from '../interfaces/public.business.settings.interface';
import { unescape } from 'lodash-es';
import { LanguagesListInterface } from '../interfaces/languages.list.interface';
import { AdminCollectionImportDownloadInterface } from '../interfaces/admin.collection.import.download.interface';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 2;
  public locales: LanguagesListInterface[] = [];
  public businessSetting: PublicBusinssSettingInterface;
  dummyArray: MatTableDataSource<DummyListInterface>;
  dummyData: DummyListInterface[] = [{ name: 'Dummy' }, { name: 'Dummy' }, { name: 'Dummy' }, { name: 'Dummy' }, { name: 'Dummy' }, { name: 'Dummy' }, { name: 'Dummy' }, { name: 'Dummy' }, { name: 'Dummy' }, { name: 'Dummy' }];
  appName: string = '';
  public collectionNames: AdminCollectionImportDownloadInterface[] = [
    {
      "key": "dining_category",
      "name": "Dining Categories",
      "sampleExcel": "xlsx/dining_category_sample.xlsx",
      "emptyExcel": "xlsx/dining_category_empty.xlsx",
      "sampleCSV": "csv/dining_category_sample.csv",
      "emptyCSV": "csv/dining_category_empty.csv",
      "uploadLink": "v1/admin/dining_category/import_collection/",
      "helper": "NA"
    },
    {
      "key": "dining_cancellation_reason",
      "name": "Dining Cancellation Messages",
      "sampleExcel": "xlsx/dining_cancellation_reason_sample.xlsx",
      "emptyExcel": "xlsx/dining_cancellation_reason_empty.xlsx",
      "sampleCSV": "csv/dining_cancellation_reason_sample.csv",
      "emptyCSV": "csv/dining_cancellation_reason_empty.csv",
      "uploadLink": "v1/admin/dining_cancel_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "dining_instructions",
      "name": "Dining Notice / Instruction",
      "sampleExcel": "xlsx/dining_instructions_sample.xlsx",
      "emptyExcel": "xlsx/dining_instructions_empty.xlsx",
      "sampleCSV": "csv/dining_instructions_sample.csv",
      "emptyCSV": "csv/dining_instructions_empty.csv",
      "uploadLink": "v1/admin/dining_notice/import_collection/",
      "helper": "NA"
    },
    {
      "key": "delivery_instruction",
      "name": "Delivery Instructions",
      "sampleExcel": "xlsx/delivery_instruction_sample.xlsx",
      "emptyExcel": "xlsx/delivery_instruction_empty.xlsx",
      "sampleCSV": "csv/delivery_instruction_sample.csv",
      "emptyCSV": "csv/delivery_instruction_empty.csv",
      "uploadLink": "v1/admin/delivery_instruction/import_collection/",
      "helper": "NA"
    },
    {
      "key": "delivery_gratitude",
      "name": "Delivery Gratitude",
      "sampleExcel": "xlsx/delivery_gratitude_sample.xlsx",
      "emptyExcel": "xlsx/delivery_gratitude_empty.xlsx",
      "sampleCSV": "csv/delivery_gratitude_sample.csv",
      "emptyCSV": "csv/delivery_gratitude_empty.csv",
      "uploadLink": "v1/admin/gratitude/import_collection/",
      "helper": "NA"
    },
    {
      "key": "driver_incentive",
      "name": "Driver Incentives",
      "sampleExcel": "xlsx/driver_incentive_sample.xlsx",
      "emptyExcel": "xlsx/driver_incentive_empty.xlsx",
      "sampleCSV": "csv/driver_incentive_sample.csv",
      "emptyCSV": "csv/driver_incentive_empty.csv",
      "uploadLink": "v1/admin/driver_incentive/import_collection/",
      "helper": "NA"
    },
    {
      "key": "driver_offline_messsage",
      "name": "Driver Offline Messages",
      "sampleExcel": "xlsx/driver_offline_messsage_sample.xlsx",
      "emptyExcel": "xlsx/driver_offline_messsage_empty.xlsx",
      "sampleCSV": "csv/driver_offline_messsage_sample.csv",
      "emptyCSV": "csv/driver_offline_messsage_empty.csv",
      "uploadLink": "v1/admin/driver_offline_messages/import_collection/",
      "helper": "NA"
    },
    {
      "key": "languages",
      "name": "Languages",
      "sampleExcel": "xlsx/languages_sample.xlsx",
      "emptyExcel": "xlsx/languages_empty.xlsx",
      "sampleCSV": "csv/languages_sample.csv",
      "emptyCSV": "csv/languages_empty.csv",
      "uploadLink": "v1/admin/language/import_collection/",
      "helper": "NA"
    },
    {
      "key": "order_cancellation_reason",
      "name": "Order Cancellation Messages",
      "sampleExcel": "xlsx/order_cancellation_reason_sample.xlsx",
      "emptyExcel": "xlsx/order_cancellation_reason_empty.xlsx",
      "sampleCSV": "csv/order_cancellation_reason_sample.csv",
      "emptyCSV": "csv/order_cancellation_reason_empty.csv",
      "uploadLink": "v1/admin/order_cancel_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "order_rating_message",
      "name": "Order Ratings Messages",
      "sampleExcel": "xlsx/order_rating_message_sample.xlsx",
      "emptyExcel": "xlsx/order_rating_message_empty.xlsx",
      "sampleCSV": "csv/order_rating_message_sample.csv",
      "emptyCSV": "csv/order_rating_message_empty.csv",
      "uploadLink": "v1/admin/order_rating_message/import_collection/",
      "helper": "NA"
    },
    {
      "key": "invoice_instructions",
      "name": "Invoice Instructions",
      "sampleExcel": "xlsx/invoice_instructions_sample.xlsx",
      "emptyExcel": "xlsx/invoice_instructions_empty.xlsx",
      "sampleCSV": "csv/invoice_instructions_sample.csv",
      "emptyCSV": "csv/invoice_instructions_empty.csv",
      "uploadLink": "v1/admin/invoice_instruction/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_food_license",
      "name": "Restaurant Food License",
      "sampleExcel": "xlsx/restaurant_food_license_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_food_license_empty.xlsx",
      "sampleCSV": "csv/restaurant_food_license_sample.csv",
      "emptyCSV": "csv/restaurant_food_license_empty.csv",
      "uploadLink": "v1/admin/restaurant_food_license/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_notice",
      "name": "Restaurant Notice",
      "sampleExcel": "xlsx/restaurant_notice_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_notice_empty.xlsx",
      "sampleCSV": "csv/restaurant_notice_sample.csv",
      "emptyCSV": "csv/restaurant_notice_empty.csv",
      "uploadLink": "v1/admin/restaurant_notice/import_collection/",
      "helper": "NA"
    },
    {
      "key": "subscription_packages",
      "name": "Subcription Package List",
      "sampleExcel": "xlsx/subscription_packages_sample.xlsx",
      "emptyExcel": "xlsx/subscription_packages_empty.xlsx",
      "sampleCSV": "csv/subscription_packages_sample.csv",
      "emptyCSV": "csv/subscription_packages_empty.csv",
      "uploadLink": "v1/admin/subscription/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_subscriber",
      "name": "Subscriber List",
      "sampleExcel": "xlsx/restaurant_subscriber_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_subscriber_empty.xlsx",
      "sampleCSV": "csv/restaurant_subscriber_sample.csv",
      "emptyCSV": "csv/restaurant_subscriber_empty.csv",
      "uploadLink": "v1/admin/subscriber/import_collection/",
      "helper": "NA"
    },
    {
      "key": "user_avatar",
      "name": "User Avatar",
      "sampleExcel": "xlsx/user_avatar_sample.xlsx",
      "emptyExcel": "xlsx/user_avatar_empty.xlsx",
      "sampleCSV": "csv/user_avatar_sample.csv",
      "emptyCSV": "csv/user_avatar_empty.csv",
      "uploadLink": "v1/admin/user_avatar/import_collection/",
      "helper": "NA"
    },
    {
      "key": "delete_account_reason",
      "name": "User Account Delete Reason",
      "sampleExcel": "xlsx/delete_account_reason_sample.xlsx",
      "emptyExcel": "xlsx/delete_account_reason_empty.xlsx",
      "sampleCSV": "csv/delete_account_reason_sample.csv",
      "emptyCSV": "csv/delete_account_reason_empty.csv",
      "uploadLink": "v1/admin/delete_account_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "customers",
      "name": "Customers",
      "sampleExcel": "xlsx/customers_sample.xlsx",
      "emptyExcel": "xlsx/customers_empty.xlsx",
      "sampleCSV": "csv/customers_sample.csv",
      "emptyCSV": "csv/customers_empty.csv",
      "uploadLink": "v1/admin/customer/import_collection/",
      "helper": "NA"
    },
    {
      "key": "loyality_points",
      "name": "Loyality Points",
      "sampleExcel": "xlsx/loyality_points_sample.xlsx",
      "emptyExcel": "xlsx/loyality_points_empty.xlsx",
      "sampleCSV": "csv/loyality_points_sample.csv",
      "emptyCSV": "csv/loyality_points_empty.csv",
      "uploadLink": "v1/admin/loyality_points/import_collection/",
      "helper": "NA"
    },
    {
      "key": "wallet_funds",
      "name": "Customer Wallet Funds",
      "sampleExcel": "xlsx/wallet_funds_sample.xlsx",
      "emptyExcel": "xlsx/wallet_funds_empty.xlsx",
      "sampleCSV": "csv/wallet_funds_sample.csv",
      "emptyCSV": "csv/wallet_funds_empty.csv",
      "uploadLink": "v1/admin/customer_wallet_fund/import_collection/",
      "helper": "NA"
    },
    {
      "key": "wallet_bonus",
      "name": "Wallet Bonus",
      "sampleExcel": "xlsx/wallet_bonus_sample.xlsx",
      "emptyExcel": "xlsx/wallet_bonus_empty.xlsx",
      "sampleCSV": "csv/wallet_bonus_sample.csv",
      "emptyCSV": "csv/wallet_bonus_empty.csv",
      "uploadLink": "v1/admin/wallet_bonus/import_collection/",
      "helper": "NA"
    },
    {
      "key": "deliveryshift",
      "name": "Shift Schedule",
      "sampleExcel": "xlsx/deliveryshift_sample.xlsx",
      "emptyExcel": "xlsx/deliveryshift_empty.xlsx",
      "sampleCSV": "csv/deliveryshift_sample.csv",
      "emptyCSV": "csv/deliveryshift_empty.csv",
      "uploadLink": "v1/admin/delivery_shift_schedule/import_collection/",
      "helper": "NA"
    },
    {
      "key": "deliveryman_wallet_funds",
      "name": "Deliveryman Wallet Funds",
      "sampleExcel": "xlsx/deliveryman_wallet_funds_sample.xlsx",
      "emptyExcel": "xlsx/deliveryman_wallet_funds_empty.xlsx",
      "sampleCSV": "csv/deliveryman_wallet_funds_sample.csv",
      "emptyCSV": "csv/deliveryman_wallet_funds_empty.csv",
      "uploadLink": "v1/admin/deliveryman_wallet_fund/import_collection/",
      "helper": "NA"
    },
    {
      "key": "system_deliveryman",
      "name": "System Deliveryman",
      "sampleExcel": "xlsx/system_deliveryman_sample.xlsx",
      "emptyExcel": "xlsx/system_deliveryman_empty.xlsx",
      "sampleCSV": "csv/system_deliveryman_sample.csv",
      "emptyCSV": "csv/system_deliveryman_empty.csv",
      "uploadLink": "v1/admin/system_deliveryman/import_collection/",
      "helper": "NA"
    },
    {
      "key": "vendor_deliveryman",
      "name": "Vendor Deliveryman",
      "sampleExcel": "xlsx/vendor_deliveryman_sample.xlsx",
      "emptyExcel": "xlsx/vendor_deliveryman_empty.xlsx",
      "sampleCSV": "csv/vendor_deliveryman_sample.csv",
      "emptyCSV": "csv/vendor_deliveryman_empty.csv",
      "uploadLink": "v1/admin/vendor_deliveryman/import_collection/",
      "helper": "NA"
    },
    {
      "key": "vehicles",
      "name": "Vehicle",
      "sampleExcel": "xlsx/vehicles_sample.xlsx",
      "emptyExcel": "xlsx/vehicles_empty.xlsx",
      "sampleCSV": "csv/vehicles_sample.csv",
      "emptyCSV": "csv/vehicles_empty.csv",
      "uploadLink": "v1/admin/vehicle/import_collection/",
      "helper": "NA"
    },
    {
      "key": "food_addons",
      "name": "Addon",
      "sampleExcel": "xlsx/food_addons_sample.xlsx",
      "emptyExcel": "xlsx/food_addons_empty.xlsx",
      "sampleCSV": "csv/food_addons_sample.csv",
      "emptyCSV": "csv/food_addons_empty.csv",
      "uploadLink": "v1/admin/addons/import_collection/",
      "helper": "NA"
    },
    {
      "key": "food_category",
      "name": "Food Category",
      "sampleExcel": "xlsx/food_category_sample.xlsx",
      "emptyExcel": "xlsx/food_category_empty.xlsx",
      "sampleCSV": "csv/food_category_sample.csv",
      "emptyCSV": "csv/food_category_empty.csv",
      "uploadLink": "v1/admin/category/import_collection/",
      "helper": "NA"
    },
    {
      "key": "food_taxation",
      "name": "Food Taxation",
      "sampleExcel": "xlsx/food_taxation_sample.xlsx",
      "emptyExcel": "xlsx/food_taxation_empty.xlsx",
      "sampleCSV": "csv/food_taxation_sample.csv",
      "emptyCSV": "csv/food_taxation_empty.csv",
      "uploadLink": "v1/admin/food_taxation/import_collection/",
      "helper": "NA"
    },
    {
      "key": "foods",
      "name": "Foods",
      "sampleExcel": "xlsx/foods_sample.xlsx",
      "emptyExcel": "xlsx/foods_empty.xlsx",
      "sampleCSV": "csv/foods_sample.csv",
      "emptyCSV": "csv/foods_empty.csv",
      "uploadLink": "v1/admin/foods/import_collection/",
      "helper": "foods"
    },
    {
      "key": "food_sub_category",
      "name": "Food Sub Category",
      "sampleExcel": "xlsx/food_sub_category_sample.xlsx",
      "emptyExcel": "xlsx/food_sub_category_empty.xlsx",
      "sampleCSV": "csv/food_sub_category_sample.csv",
      "emptyCSV": "csv/food_sub_category_empty.csv",
      "uploadLink": "v1/admin/sub_category/import_collection/",
      "helper": "NA"
    },
    {
      "key": "media_files",
      "name": "Media Files",
      "sampleExcel": "xlsx/media_files_sample.xlsx",
      "emptyExcel": "xlsx/media_files_empty.xlsx",
      "sampleCSV": "csv/media_files_sample.csv",
      "emptyCSV": "csv/media_files_empty.csv",
      "uploadLink": "v1/admin/medias/import_collection/",
      "helper": "NA"
    },
    {
      "key": "tiffin_package_cancel_reason",
      "name": "Tiffin Cancellation Reasons",
      "sampleExcel": "xlsx/tiffin_package_cancel_reason_sample.xlsx",
      "emptyExcel": "xlsx/tiffin_package_cancel_reason_empty.xlsx",
      "sampleCSV": "csv/tiffin_package_cancel_reason_sample.csv",
      "emptyCSV": "csv/tiffin_package_cancel_reason_empty.csv",
      "uploadLink": "v1/admin/tiffin_subscription_cancel_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "tiffin_packages_list",
      "name": "Tiffin Subscription Package",
      "sampleExcel": "xlsx/tiffin_packages_list_sample.xlsx",
      "emptyExcel": "xlsx/tiffin_packages_list_empty.xlsx",
      "sampleCSV": "csv/tiffin_packages_list_sample.csv",
      "emptyCSV": "csv/tiffin_packages_list_empty.csv",
      "uploadLink": "v1/admin/tiffin_packages_list/import_collection/",
      "helper": "tiffin_packages_list"
    },
    {
      "key": "tiffin_purchased_list",
      "name": "Tiffin Subscription Purchased List",
      "sampleExcel": "xlsx/tiffin_purchased_list_sample.xlsx",
      "emptyExcel": "xlsx/tiffin_purchased_list_empty.xlsx",
      "sampleCSV": "csv/tiffin_purchased_list_sample.csv",
      "emptyCSV": "csv/tiffin_purchased_list_empty.csv",
      "uploadLink": "v1/admin/tiffin_purchased_list/import_collection/",
      "helper": "NA"
    },
    {
      "key": "dining_booking",
      "name": "Dining Booking",
      "sampleExcel": "xlsx/dining_booking_sample.xlsx",
      "emptyExcel": "xlsx/dining_booking_empty.xlsx",
      "sampleCSV": "csv/dining_booking_sample.csv",
      "emptyCSV": "csv/dining_booking_empty.csv",
      "uploadLink": "v1/admin/dining_booking/import_collection/",
      "helper": "NA"
    },
    {
      "key": "customer_complaints",
      "name": "Customer Complaints",
      "sampleExcel": "xlsx/customer_complaints_sample.xlsx",
      "emptyExcel": "xlsx/customer_complaints_empty.xlsx",
      "sampleCSV": "csv/customer_complaints_sample.csv",
      "emptyCSV": "csv/customer_complaints_empty.csv",
      "uploadLink": "v1/admin/customer_complaints/import_collection/",
      "helper": "NA"
    },
    {
      "key": "complaint_reason",
      "name": "Complaints Reasons",
      "sampleExcel": "xlsx/complaint_reason_sample.xlsx",
      "emptyExcel": "xlsx/complaint_reason_empty.xlsx",
      "sampleCSV": "csv/complaint_reason_sample.csv",
      "emptyCSV": "csv/complaint_reason_empty.csv",
      "uploadLink": "v1/admin/complaints_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_complaints",
      "name": "Restaurant Complaints",
      "sampleExcel": "xlsx/restaurant_complaints_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_complaints_empty.xlsx",
      "sampleCSV": "csv/restaurant_complaints_sample.csv",
      "emptyCSV": "csv/restaurant_complaints_empty.csv",
      "uploadLink": "v1/admin/restaurant_complaints/import_collection/",
      "helper": "NA"
    },
    {
      "key": "regular_orders",
      "name": "Regular Orders",
      "sampleExcel": "xlsx/regular_orders_sample.xlsx",
      "emptyExcel": "xlsx/regular_orders_empty.xlsx",
      "sampleCSV": "csv/regular_orders_sample.csv",
      "emptyCSV": "csv/regular_orders_empty.csv",
      "uploadLink": "v1/admin/regular_orders/import_collection/",
      "helper": "NA"
    },
    {
      "key": "dining_refund_request",
      "name": "Dining Booking Refund Request",
      "sampleExcel": "xlsx/dining_refund_request_sample.xlsx",
      "emptyExcel": "xlsx/dining_refund_request_empty.xlsx",
      "sampleCSV": "csv/dining_refund_request_sample.csv",
      "emptyCSV": "csv/dining_refund_request_empty.csv",
      "uploadLink": "v1/admin/dining_refund_request/import_collection/",
      "helper": "NA"
    },
    {
      "key": "dining_refund_reason",
      "name": "Dining Refund Reason",
      "sampleExcel": "xlsx/dining_refund_reason_sample.xlsx",
      "emptyExcel": "xlsx/dining_refund_reason_empty.xlsx",
      "sampleCSV": "csv/dining_refund_reason_sample.csv",
      "emptyCSV": "csv/dining_refund_reason_empty.csv",
      "uploadLink": "v1/admin/dining_booking_refund_request_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "order_refund_request",
      "name": "Regular Order Refund Request",
      "sampleExcel": "xlsx/order_refund_request_sample.xlsx",
      "emptyExcel": "xlsx/order_refund_request_empty.xlsx",
      "sampleCSV": "csv/order_refund_request_sample.csv",
      "emptyCSV": "csv/order_refund_request_empty.csv",
      "uploadLink": "v1/admin/order_refund_request/import_collection/",
      "helper": "NA"
    },
    {
      "key": "order_refund_reason",
      "name": "Order Refund Reason",
      "sampleExcel": "xlsx/order_refund_reason_sample.xlsx",
      "emptyExcel": "xlsx/order_refund_reason_empty.xlsx",
      "sampleCSV": "csv/order_refund_reason_sample.csv",
      "emptyCSV": "csv/order_refund_reason_empty.csv",
      "uploadLink": "v1/admin/refund_request_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "tiffin_refund_request",
      "name": "Tiffin Subscription Refund Request",
      "sampleExcel": "xlsx/tiffin_refund_request_sample.xlsx",
      "emptyExcel": "xlsx/tiffin_refund_request_empty.xlsx",
      "sampleCSV": "csv/tiffin_refund_request_sample.csv",
      "emptyCSV": "csv/tiffin_refund_request_empty.csv",
      "uploadLink": "v1/admin/tiffin_refund_request/import_collection/",
      "helper": "NA"
    },
    {
      "key": "tiffin_package_refund_reason",
      "name": "Tiffin Refund Reason",
      "sampleExcel": "xlsx/tiffin_package_refund_reason_sample.xlsx",
      "emptyExcel": "xlsx/tiffin_package_refund_reason_empty.xlsx",
      "sampleCSV": "csv/tiffin_package_refund_reason_sample.csv",
      "emptyCSV": "csv/tiffin_package_refund_reason_empty.csv",
      "uploadLink": "v1/admin/tiffin_subscription_refund_request_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "vendor_pos_order_list",
      "name": "Vendor POS Orders",
      "sampleExcel": "xlsx/vendor_pos_order_list_sample.xlsx",
      "emptyExcel": "xlsx/vendor_pos_order_list_empty.xlsx",
      "sampleCSV": "csv/vendor_pos_order_list_sample.csv",
      "emptyCSV": "csv/vendor_pos_order_list_empty.csv",
      "uploadLink": "v1/admin/vendor_pos_order_list/import_collection/",
      "helper": "NA"
    },
    {
      "key": "vendor_table_order_list",
      "name": "Vendor Table Orders",
      "sampleExcel": "xlsx/vendor_table_order_list_sample.xlsx",
      "emptyExcel": "xlsx/vendor_table_order_list_empty.xlsx",
      "sampleCSV": "csv/vendor_table_order_list_sample.csv",
      "emptyCSV": "csv/vendor_table_order_list_empty.csv",
      "uploadLink": "v1/admin/vendor_table_order_list/import_collection/",
      "helper": "NA"
    },
    {
      "key": "banners",
      "name": "Banners",
      "sampleExcel": "xlsx/banners_sample.xlsx",
      "emptyExcel": "xlsx/banners_empty.xlsx",
      "sampleCSV": "csv/banners_sample.csv",
      "emptyCSV": "csv/banners_empty.csv",
      "uploadLink": "v1/admin/banners/import_collection/",
      "helper": "NA"
    },
    {
      "key": "dining_campaign",
      "name": "Dining Campaign",
      "sampleExcel": "xlsx/dining_campaign_sample.xlsx",
      "emptyExcel": "xlsx/dining_campaign_empty.xlsx",
      "sampleCSV": "csv/dining_campaign_sample.csv",
      "emptyCSV": "csv/dining_campaign_empty.csv",
      "uploadLink": "v1/admin/dining_campaign/import_collection/",
      "helper": "NA"
    },
    {
      "key": "food_campaign",
      "name": "Food Campaign",
      "sampleExcel": "xlsx/food_campaign_sample.xlsx",
      "emptyExcel": "xlsx/food_campaign_empty.xlsx",
      "sampleCSV": "csv/food_campaign_sample.csv",
      "emptyCSV": "csv/food_campaign_empty.csv",
      "uploadLink": "v1/admin/food_campaign/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_campaign",
      "name": "Restaurant Campaign",
      "sampleExcel": "xlsx/restaurant_campaign_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_campaign_empty.xlsx",
      "sampleCSV": "csv/restaurant_campaign_sample.csv",
      "emptyCSV": "csv/restaurant_campaign_empty.csv",
      "uploadLink": "v1/admin/restaurant_campaign/import_collection/",
      "helper": "NA"
    },
    {
      "key": "order_coupon",
      "name": "Order Coupon",
      "sampleExcel": "xlsx/order_coupon_sample.xlsx",
      "emptyExcel": "xlsx/order_coupon_empty.xlsx",
      "sampleCSV": "csv/order_coupon_sample.csv",
      "emptyCSV": "csv/order_coupon_empty.csv",
      "uploadLink": "v1/admin/order_coupon/import_collection/",
      "helper": "NA"
    },
    {
      "key": "dining_coupon",
      "name": "Dining Booking Coupon",
      "sampleExcel": "xlsx/dining_coupon_sample.xlsx",
      "emptyExcel": "xlsx/dining_coupon_empty.xlsx",
      "sampleCSV": "csv/dining_coupon_sample.csv",
      "emptyCSV": "csv/dining_coupon_empty.csv",
      "uploadLink": "v1/admin/dining_coupon/import_collection/",
      "helper": "NA"
    },
    {
      "key": "admin_expense",
      "name": "Admin Expense",
      "sampleExcel": "xlsx/admin_expense_sample.xlsx",
      "emptyExcel": "xlsx/admin_expense_empty.xlsx",
      "sampleCSV": "csv/admin_expense_sample.csv",
      "emptyCSV": "csv/admin_expense_empty.csv",
      "uploadLink": "v1/admin/admin_expense/import_collection/",
      "helper": "NA"
    },
    {
      "key": "payment_transactions",
      "name": "Payment Transactions",
      "sampleExcel": "xlsx/payment_transactions_sample.xlsx",
      "emptyExcel": "xlsx/payment_transactions_empty.xlsx",
      "sampleCSV": "csv/payment_transactions_sample.csv",
      "emptyCSV": "csv/payment_transactions_empty.csv",
      "uploadLink": "v1/admin/payment_transactions/import_collection/",
      "helper": "NA"
    },
    {
      "key": "wallet_transactions",
      "name": "Wallet Transactions",
      "sampleExcel": "xlsx/wallet_transactions_sample.xlsx",
      "emptyExcel": "xlsx/wallet_transactions_empty.xlsx",
      "sampleCSV": "csv/wallet_transactions_sample.csv",
      "emptyCSV": "csv/wallet_transactions_empty.csv",
      "uploadLink": "v1/admin/wallet_transactions/import_collection/",
      "helper": "NA"
    },
    {
      "key": "cities",
      "name": "Cities",
      "sampleExcel": "xlsx/cities_sample.xlsx",
      "emptyExcel": "xlsx/cities_empty.xlsx",
      "sampleCSV": "csv/cities_sample.csv",
      "emptyCSV": "csv/cities_empty.csv",
      "uploadLink": "v1/admin/cities/import_collection/",
      "helper": "NA"
    },
    {
      "key": "cuisine",
      "name": "Cuisine",
      "sampleExcel": "xlsx/cuisine_sample.xlsx",
      "emptyExcel": "xlsx/cuisine_empty.xlsx",
      "sampleCSV": "csv/cuisine_sample.csv",
      "emptyCSV": "csv/cuisine_empty.csv",
      "uploadLink": "v1/admin/cuisine/import_collection/",
      "helper": "NA"
    },
    {
      "key": "hidden_restaurants",
      "name": "Hidden Restaurant's",
      "sampleExcel": "xlsx/hidden_restaurants_sample.xlsx",
      "emptyExcel": "xlsx/hidden_restaurants_empty.xlsx",
      "sampleCSV": "csv/hidden_restaurants_sample.csv",
      "emptyCSV": "csv/hidden_restaurants_empty.csv",
      "uploadLink": "v1/admin/hidden_restaurant/import_collection/",
      "helper": "NA"
    },
    {
      "key": "hidden_restaurant_reason",
      "name": "Hidden Restaurant Reason",
      "sampleExcel": "xlsx/hidden_restaurant_reason_sample.xlsx",
      "emptyExcel": "xlsx/hidden_restaurant_reason_empty.xlsx",
      "sampleCSV": "csv/hidden_restaurant_reason_sample.csv",
      "emptyCSV": "csv/hidden_restaurant_reason_empty.csv",
      "uploadLink": "v1/admin/hide_restaurant_reason/import_collection/",
      "helper": "NA"
    },
    {
      "key": "localities",
      "name": "Localities",
      "sampleExcel": "xlsx/localities_sample.xlsx",
      "emptyExcel": "xlsx/localities_empty.xlsx",
      "sampleCSV": "csv/localities_sample.csv",
      "emptyCSV": "csv/localities_empty.csv",
      "uploadLink": "v1/admin/localities/import_collection/",
      "helper": "NA"
    },
    {
      "key": "outlets",
      "name": "Restaurant Outlets",
      "sampleExcel": "xlsx/outlets_sample.xlsx",
      "emptyExcel": "xlsx/outlets_empty.xlsx",
      "sampleCSV": "csv/outlets_sample.csv",
      "emptyCSV": "csv/outlets_empty.csv",
      "uploadLink": "v1/admin/outlets/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_report_issue",
      "name": "Restaurant Report Issue's",
      "sampleExcel": "xlsx/restaurant_report_issue_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_report_issue_empty.xlsx",
      "sampleCSV": "csv/restaurant_report_issue_sample.csv",
      "emptyCSV": "csv/restaurant_report_issue_empty.csv",
      "uploadLink": "v1/admin/report_issue_list/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_report_issue_reason",
      "name": "Report Issue's Reason",
      "sampleExcel": "xlsx/restaurant_report_issue_reason_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_report_issue_reason_empty.xlsx",
      "sampleCSV": "csv/restaurant_report_issue_reason_sample.csv",
      "emptyCSV": "csv/restaurant_report_issue_reason_empty.csv",
      "uploadLink": "v1/admin/report_issue_restaurant/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_facilities",
      "name": "Facilities",
      "sampleExcel": "xlsx/restaurant_facilities_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_facilities_empty.xlsx",
      "sampleCSV": "csv/restaurant_facilities_sample.csv",
      "emptyCSV": "csv/restaurant_facilities_empty.csv",
      "uploadLink": "v1/admin/restaurant_facilities/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_kitchen_owner",
      "name": "Restaurant Kitchen Owners",
      "sampleExcel": "xlsx/restaurant_kitchen_owner_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_kitchen_owner_empty.xlsx",
      "sampleCSV": "csv/restaurant_kitchen_owner_sample.csv",
      "emptyCSV": "csv/restaurant_kitchen_owner_empty.csv",
      "uploadLink": "v1/admin/restaurant_kitchen_owner/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_type",
      "name": "Restaurant Types",
      "sampleExcel": "xlsx/restaurant_type_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_type_empty.xlsx",
      "sampleCSV": "csv/restaurant_type_sample.csv",
      "emptyCSV": "csv/restaurant_type_empty.csv",
      "uploadLink": "v1/admin/restaurant_type/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurant_waiters",
      "name": "Restaurant Waiters",
      "sampleExcel": "xlsx/restaurant_waiters_sample.xlsx",
      "emptyExcel": "xlsx/restaurant_waiters_empty.xlsx",
      "sampleCSV": "csv/restaurant_waiters_sample.csv",
      "emptyCSV": "csv/restaurant_waiters_empty.csv",
      "uploadLink": "v1/admin/restaurant_waiters/import_collection/",
      "helper": "NA"
    },
    {
      "key": "restaurants",
      "name": "Restaurant",
      "sampleExcel": "xlsx/restaurants_sample.xlsx",
      "emptyExcel": "xlsx/restaurants_empty.xlsx",
      "sampleCSV": "csv/restaurants_sample.csv",
      "emptyCSV": "csv/restaurants_empty.csv",
      "uploadLink": "v1/admin/restaurants/import_collection/",
      "helper": "NA"
    },
    {
      "key": "accountants",
      "name": "Accountant Team",
      "sampleExcel": "xlsx/auth_role_sample.xlsx",
      "emptyExcel": "xlsx/auth_role_empty.xlsx",
      "sampleCSV": "csv/auth_role_sample.csv",
      "emptyCSV": "csv/auth_role_empty.csv",
      "uploadLink": "v1/admin/auth_role/import_collection?role=accountant",
      "helper": "NA"
    },
    {
      "key": "administrator",
      "name": "Administrator Team",
      "sampleExcel": "xlsx/auth_role_sample.xlsx",
      "emptyExcel": "xlsx/auth_role_empty.xlsx",
      "sampleCSV": "csv/auth_role_sample.csv",
      "emptyCSV": "csv/auth_role_empty.csv",
      "uploadLink": "v1/admin/auth_role/import_collection?role=admin",
      "helper": "NA"
    },
    {
      "key": "cityzen",
      "name": "Cityzen Team",
      "sampleExcel": "xlsx/auth_role_sample.xlsx",
      "emptyExcel": "xlsx/auth_role_empty.xlsx",
      "sampleCSV": "csv/auth_role_sample.csv",
      "emptyCSV": "csv/auth_role_empty.csv",
      "uploadLink": "v1/admin/auth_role/import_collection?role=cityMaster",
      "helper": "NA"
    },
    {
      "key": "support_team",
      "name": "Support Team",
      "sampleExcel": "xlsx/auth_role_sample.xlsx",
      "emptyExcel": "xlsx/auth_role_empty.xlsx",
      "sampleCSV": "csv/auth_role_sample.csv",
      "emptyCSV": "csv/auth_role_empty.csv",
      "uploadLink": "v1/admin/auth_role/import_collection?role=supportTeam",
      "helper": "NA"
    },
    {
      "key": "collected_cash",
      "name": "Cash Collection",
      "sampleExcel": "xlsx/collected_cash_sample.xlsx",
      "emptyExcel": "xlsx/collected_cash_empty.xlsx",
      "sampleCSV": "csv/collected_cash_sample.csv",
      "emptyCSV": "csv/collected_cash_empty.csv",
      "uploadLink": "v1/admin/cash_collection/import_collection/",
      "helper": "NA"
    },
    {
      "key": "withdrawal_methods",
      "name": "Withdrawal Methods",
      "sampleExcel": "xlsx/withdrawal_methods_sample.xlsx",
      "emptyExcel": "xlsx/withdrawal_methods_empty.xlsx",
      "sampleCSV": "csv/withdrawal_methods_sample.csv",
      "emptyCSV": "csv/withdrawal_methods_empty.csv",
      "uploadLink": "v1/admin/withdrawal_methods/import_collection/",
      "helper": "withdrawal_methods"
    },
    {
      "key": "chat_list",
      "name": "Regular Chat List",
      "sampleExcel": "xlsx/chat_list_sample.xlsx",
      "emptyExcel": "xlsx/chat_list_empty.xlsx",
      "sampleCSV": "csv/chat_list_sample.csv",
      "emptyCSV": "csv/chat_list_empty.csv",
      "uploadLink": "v1/admin/regular_chat_list/import_collection/",
      "helper": "NA"
    },
    {
      "key": "chat_messages",
      "name": "Regular Chat Messages",
      "sampleExcel": "xlsx/chat_messages_sample.xlsx",
      "emptyExcel": "xlsx/chat_messages_empty.xlsx",
      "sampleCSV": "csv/chat_messages_sample.csv",
      "emptyCSV": "csv/chat_messages_empty.csv",
      "uploadLink": "v1/admin/regular_chat_messages/import_collection/",
      "helper": "NA"
    },
    {
      "key": "support_chat_list",
      "name": "Support Chat List",
      "sampleExcel": "xlsx/support_chat_list_sample.xlsx",
      "emptyExcel": "xlsx/support_chat_list_empty.xlsx",
      "sampleCSV": "csv/support_chat_list_sample.csv",
      "emptyCSV": "csv/support_chat_list_empty.csv",
      "uploadLink": "v1/admin/support_chat_list/import_collection/",
      "helper": "NA"
    },
    {
      "key": "support_chat_messages",
      "name": "Support Chat Messages",
      "sampleExcel": "xlsx/support_chat_messages_sample.xlsx",
      "emptyExcel": "xlsx/support_chat_messages_empty.xlsx",
      "sampleCSV": "csv/support_chat_messages_sample.csv",
      "emptyCSV": "csv/support_chat_messages_empty.csv",
      "uploadLink": "v1/admin/support_chat_messages/import_collection/",
      "helper": "NA"
    },
    // NOTE: no stores import entries. The four removed here pointed at
    // v1/admin/<x>/import_collection/ routes that do not exist, with sample
    // columns matching no model (flat taxId, scopeType=single, invented policy
    // types). Stores bulk import is doc §9 step 8 + stores.import.templates
    // work: schemaArray entries + templates whose columns match the models.
    // Re-add per-collection entries only with a live upload route behind them.
  ];
  constructor(
    // private snackBar: MatSnackBar,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.appName = environment.appName;
    this.dummyArray = new MatTableDataSource<DummyListInterface>(this.dummyData);
  }

  start(message?: string): MatDialogRef<LoadingDialog> {
    const msg = !message ? "ts_loading" : message;

    const dialogRef = this.dialog.open(LoadingDialog, {
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: msg,
      panelClass: 'loader-dialog-container',
      width: 'auto',
      maxWidth: 'none',
      minWidth: '0px',
    });

    this.translateService.get(msg).subscribe((tMessage: string) => {
      dialogRef.componentInstance.data = tMessage;
    });

    return dialogRef;
  }

  stop(ref: MatDialogRef<LoadingDialog>) {
    if (ref) {
      ref.close();
    }
  }

  public async tErrorTranslate(input: string): Promise<string> {
    const direct = this.translateService.instant(input);
    if (direct !== input) {
      return direct; // If this returns Hindi, we are done.
    }

    const foundKey = await this.findKeyByValueInLang(input, 'en');

    if (foundKey) {
      const translated = await firstValueFrom(this.translateService.get(foundKey));
      return translated;
    }

    return input;
  }

  private async findKeyByValueInLang(value: string, lang: string): Promise<string | null> {
    const translations = await firstValueFrom(this.translateService.currentLoader.getTranslation(lang));

    if (!translations) return null;

    const search = (obj: any, prefix = ''): string | null => {
      for (const key of Object.keys(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const currentValue = obj[key];

        if (typeof currentValue === 'string') {
          // Case-insensitive comparison is safer for API messages
          if (currentValue.toLowerCase().trim() === value.toLowerCase().trim()) {
            return newKey;
          }
        } else if (currentValue && typeof currentValue === 'object') {
          const result = search(currentValue, newKey);
          if (result) return result;
        }
      }
      return null;
    };

    return search(translations);
  }

  async onError(msg: string, extra: string) {
    const tMessage = await this.tErrorTranslate(msg);
    const translated = tMessage.replaceAll('##dynamic##', extra);
    const tClose = this.appTranslate('error');
    this.toastr.error(translated, tClose, { positionClass: 'toast-bottom-right' });
  }

  onSuccess(msg: string) {
    const tMessage = this.appTranslate(msg);
    const tClose = this.appTranslate('success');
    this.toastr.success(tMessage, tClose, { positionClass: 'toast-bottom-right' });
  }

  onInfo(msg: string, title = 'info') {
    this.toastr.info(msg, this.appTranslate(title), {
      positionClass: 'toast-top-right',
      timeOut: 12000,
      progressBar: true,
    });
  }

  public setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  public getItem(key: string) {
    let data = localStorage.getItem(key) || "";
    return data;
  }

  public priceFormat(price: number) {
    let currencySymbol = this.getItem('_currencySymbol');
    let currencySide = this.getItem('_currencySide');
    if (currencySymbol == null || currencySymbol == '' || currencySymbol == 'null') {
      currencySymbol = '$';
    }
    if (currencySide == null || currencySide == '' || currencySide == 'null') {
      currencySide = 'left';
    }
    return currencySide == 'left' ? `${currencySymbol}${price}` : `${price}${currencySymbol}`;
  }

  public numberFormat(numberValue: number) {
    let value: string = numberValue.toString();
    if (numberValue >= 1000 && numberValue < 1000000) {
      value = (numberValue / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; // Convert to 'k'
    } else if (numberValue >= 1000000) {
      value = (numberValue / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'; // Convert to 'M'
    }
    return value;
  }

  public priceFormatString(value: number) {
    let price: string = value.toString();
    if (value >= 1000 && value < 1000000) {
      price = (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; // Convert to 'k'
    } else if (value >= 1000000) {
      price = (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'; // Convert to 'M'
    }
    let currencySymbol = this.getItem('_currencySymbol');
    let currencySide = this.getItem('_currencySide');
    if (currencySymbol == null || currencySymbol == '' || currencySymbol == 'null') {
      currencySymbol = '$';
    }
    if (currencySide == null || currencySide == '' || currencySide == 'null') {
      currencySide = 'left';
    }
    return currencySide == 'left' ? `${currencySymbol}${price}` : `${price}${currencySymbol}`;
  }

  public clearItem() {
    const appLocale = this.getItem('_appLocale');
    const currencySymbol = this.getItem('_currencySymbol');
    const currencySide = this.getItem('_currencySide');
    const brand_logo = this.getItem('_brand_logo');
    const restaurantLoginWith = this.getItem('_restaurantLoginWith');
    const restaurantResetPasswordWith = this.getItem('_restaurantResetPasswordWith');
    const userLoginWith = this.getItem('_userLoginWith');
    const userResetPasswordWith = this.getItem('_userResetPasswordWith');
    const userSignUpVerification = this.getItem('_userSignUpVerification');
    const restaurantSelfRegister = this.getItem('_restaurantSelfRegister');
    const deliverymanSelfRegister = this.getItem('_deliverymanSelfRegister');
    const appTheme = this.getItem('_appTheme');

    localStorage.clear();
    this.setItem('_appLocale', appLocale);
    this.setItem('_currencySymbol', currencySymbol);
    this.setItem('_currencySide', currencySide);
    this.setItem('_brand_logo', brand_logo);
    this.setItem('_restaurantLoginWith', restaurantLoginWith);
    this.setItem('_restaurantResetPasswordWith', restaurantResetPasswordWith);
    this.setItem('_userLoginWith', userLoginWith);
    this.setItem('_userResetPasswordWith', userResetPasswordWith);
    this.setItem('_userSignUpVerification', userSignUpVerification);
    this.setItem('_restaurantSelfRegister', restaurantSelfRegister);
    this.setItem('_deliverymanSelfRegister', deliverymanSelfRegister);
    this.setItem('_appTheme', appTheme);
  }

  public clearKey(key: string) {
    localStorage.removeItem(key);
  }

  public handleError(error: any, request: string) {
    if (error && error.status && (error.status == 401 || error.status == 403)) {
      this.clearKey('_authRole');
      this.clearKey('_uid');
      this.onError('ts_unauthorized', '');
      let navigateUrl = 'support';
      if (request == 'admin') {
        navigateUrl = '/authentication/admin';
      } else if (request == 'vendor') {
        navigateUrl = '/authentication/vendor';
      } else if (request == 'support-team') {
        navigateUrl = '/authentication/support';
      } else if (request == 'accountant') {
        navigateUrl = '/authentication/accountant';
      } else if (request == 'cityzen') {
        navigateUrl = '/authentication/cityzen';
      } else if (request == 'public') {
        navigateUrl = '/';
      }
      this.router.navigate([navigateUrl]);
    } else if (error && error.status && error.status == 400) {
      if (error && error.error && error.error.message && error.error.message != '') {
        console.log(error.error);
        console.log(error.error.message);
        const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
        this.onError(error.error.message, extra);
      } else if (error && error.error && error.error.error && error.error.error != '') {
        const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
        this.onError(error.error.error, extra);
      } else {
        this.onError('ts_something_went_wrong', '');
      }
    } else if (error && error.status && error.status == 404) {
      if (error && error.error && error.error.message && error.error.message != '') {
        console.log(error.error);
        console.log(error.error.message);
        const extra = error && error.error && error.error.extra && error.error.extra != null && error.error.extra != '' ? error.error.extra : '';
        this.onError(error.error.message, extra);
      } else {
        this.onError('ts_something_went_wrong', '');
      }
    } else {
      // CORS, network failures, and S3 PUT errors land here with no `status`.
      // Surface the real error so the admin panel isn't a guessing game.
      const detail = error?.message || error?.statusText || (typeof error === 'string' ? error : JSON.stringify(error));
      this.onError(detail, error?.url ? `URL: ${error.url}` : (error?.name ? `name: ${error.name}` : ''));
    }
  }

  public htmlDecode(inp: any) {
    return unescape(inp);
  }

  public titleize(slugTitle: string) {
    var words = slugTitle.split("-");
    return words.map(function (word: string) {
      return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  }

  getDistance(lat1: number, lon1: number, lat2: number, lon2: number, unit: 'K' | 'M' = 'K'): number {
    const R = unit === 'K' ? 6371 : 3958.8; // Radius of Earth in km or miles
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in selected unit
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  public trimText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  refId(ref: string) {
    function formatString(input: string) {
      const firstFour = input.substring(0, 4);
      const lastFour = input.substring(input.length - 4);
      const middle = '**';
      return `${firstFour}${middle}${lastFour}`;
    }
    const refIdString = ref != '' && ref != null ? ref : '000000000000000000000000';
    const formattedString = formatString(refIdString);
    return formattedString;
  }


  public appTranslate(key: string): string {
    const targetLang = this.translateService.currentLang || this.translateService.getDefaultLang();

    if (!targetLang) {
      console.warn('TranslateService not initialized yet!');
    }

    return this.translateService.instant(key);
  }

  public appLocaleName(): string {
    const appLocale = localStorage.getItem('_appLocale') || 'en';
    return appLocale;
  }

  /**
   * Whether the signed-in operator holds a named right.
   *
   * The rights come from the `v1/admin/web_guard/:uid` profile, cached by
   * `adminAuthGuard` under `_adminRights`. They are the role's static list.
   *
   * This is presentation only. Every right is enforced server-side, so a wrong
   * answer here cannot grant access to anything — it can only show a control that
   * would have failed anyway. The one thing it must never do is *hide* a control
   * from someone who does hold the right, so an unreadable or missing cache
   * deliberately reads as "has the right" and lets the API decide.
   */
  public hasRight(right: string): boolean {
    const raw = localStorage.getItem('_adminRights');
    if (!raw) {
      return true;
    }
    try {
      const rights = JSON.parse(raw);
      return Array.isArray(rights) ? rights.includes(right) : true;
    } catch (error) {
      // A corrupt cache is not a reason to lock an operator out of their own panel.
      return true;
    }
  }

  public generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
