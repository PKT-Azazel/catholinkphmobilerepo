import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { TermsOfServicePage } from '../pages/terms-of-service/terms-of-service';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { MainMenuComponent } from '../components/main-menu/main-menu';
import { InformationFinderPage } from '../pages/information-finder/information-finder';
import { InformationFinderSearchDiocesePage } from '../pages/information-finder/information-finder-search-diocese/information-finder-search-diocese';
import { InformationFinderDetailDiocesePage } from '../pages/information-finder/information-finder-detail-diocese/information-finder-detail-diocese';
import { InformationFinderSearchChurchPage } from '../pages/information-finder/information-finder-search-church/information-finder-search-church';
import { InformationFinderDetailChurchPage } from '../pages/information-finder/information-finder-detail-church/information-finder-detail-church';
import { InformationFinderCatholicSchoolPage } from '../pages/information-finder/information-finder-catholic-school/information-finder-catholic-school';
import { InformationFinderSearchOrganizationPage } from '../pages/information-finder/information-finder-search-organization/information-finder-search-organization';
import { InformationFinderDetailOrganizationPage } from '../pages/information-finder/information-finder-detail-organization/information-finder-detail-organization';
import { InformationFinderSocialServicesPage } from '../pages/information-finder/information-finder-social-services/information-finder-social-services';
import { InformationFinderReligiousCongregationsPage } from '../pages/information-finder/information-finder-religious-congregations/information-finder-religious-congregations';
import { InformationFinderCounselingCentersPage } from '../pages/information-finder/information-finder-counseling-centers/information-finder-counseling-centers';
import { InformationFinderRetreatCentersPage } from '../pages/information-finder/information-finder-retreat-centers/information-finder-retreat-centers';

import { TeachingsPage } from '../pages/teachings/teachings';
import { DoctrinesComponent } from '../pages/teachings/teachings-sub-contents/doctrines/doctrines.component';
import { SacramentsComponent } from '../pages/teachings/teachings-sub-contents/sacraments/sacraments.component';
import { CommandmentsComponent } from '../pages/teachings/teachings-sub-contents/commandments/commandments.component';
import { PrayersComponent } from '../pages/teachings/teachings-sub-contents/prayers/prayers.component';
import { SaintsComponent } from '../pages/teachings/teachings-sub-contents/saints/saints.component';
import { DevotionsComponent } from '../pages/teachings/teachings-sub-contents/devotions/devotions.component';
import { DocumentsComponent } from '../pages/teachings/teachings-sub-contents/documents/documents.component';
import { TeachingsFaqComponent } from '../pages/teachings/teachings-sub-contents/teachings-faq/teachings-faq.component';

import { PopeFrancisPage } from '../pages/pope-francis/pope-francis';
import { PopeFrancisItineraryComponent } from '../pages/pope-francis/pope-francis-contents/pope-francis-itinerary/pope-francis-itinerary';
import { PopeFrancisQuotesComponent } from '../pages/pope-francis/pope-francis-contents/pope-francis-quotes/pope-francis-quotes';
import { PopeFrancisVideoComponent } from '../pages/pope-francis/pope-francis-contents/pope-francis-video/pope-francis-video';
import { PopeFrancisBibliographyComponent } from '../pages/pope-francis/pope-francis-contents/pope-francis-bibliography/pope-francis-bibliography';

import { InspirationalPage } from '../pages/inspirational/inspirational';

import { DonationDrivePage } from '../pages/donation-drive/donation-drive';
import { DonationDriveListPage } from '../pages/donation-drive/donation-drive-list/donation-drive-list';
import { DonationDriveDetailPage } from '../pages/donation-drive/donation-drive-detail/donation-drive-detail';

import { BfastPage } from '../pages/bfast/bfast';
import { BfastChatPage } from '../pages/bfast-chat/bfast-chat';

import { AgmCoreModule } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services/google-maps-api-wrapper';

import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { FileService } from '../providers/file/file.service';
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    SignupPage,
    TermsOfServicePage,
    ResetPasswordPage,
    MainMenuComponent,
    InformationFinderPage,
    InformationFinderSearchDiocesePage,
    InformationFinderDetailDiocesePage,
    InformationFinderSearchChurchPage,
    InformationFinderDetailChurchPage,
    InformationFinderCatholicSchoolPage,
    InformationFinderSearchOrganizationPage,
    InformationFinderDetailOrganizationPage,
    InformationFinderSocialServicesPage,
    InformationFinderReligiousCongregationsPage,
    InformationFinderCounselingCentersPage,
    InformationFinderRetreatCentersPage,
    TeachingsPage,
    DoctrinesComponent,
    SacramentsComponent,
    CommandmentsComponent,
    PrayersComponent,
    SaintsComponent,
    DevotionsComponent,
    DocumentsComponent,
    TeachingsFaqComponent,
    PopeFrancisPage,
    PopeFrancisItineraryComponent,
    PopeFrancisQuotesComponent,
    PopeFrancisVideoComponent,
    PopeFrancisBibliographyComponent,
    InspirationalPage,
    DonationDrivePage,
    DonationDriveListPage,
    DonationDriveDetailPage,
    BfastPage,
    BfastChatPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCYuVSEPho8Ors238VnkfDy99ZVNc5oh0I'
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    SignupPage,
    TermsOfServicePage,
    ResetPasswordPage,
    MainMenuComponent,
    InformationFinderPage,
    InformationFinderSearchDiocesePage,
    InformationFinderDetailDiocesePage,
    InformationFinderSearchChurchPage,
    InformationFinderDetailChurchPage,
    InformationFinderCatholicSchoolPage,
    InformationFinderSearchOrganizationPage,
    InformationFinderDetailOrganizationPage,
    InformationFinderSocialServicesPage,
    InformationFinderReligiousCongregationsPage,
    InformationFinderCounselingCentersPage,
    InformationFinderRetreatCentersPage,
    TeachingsPage,
    DoctrinesComponent,
    SacramentsComponent,
    CommandmentsComponent,
    PrayersComponent,
    SaintsComponent,
    DevotionsComponent,
    DocumentsComponent,
    TeachingsFaqComponent,
    PopeFrancisPage,
    PopeFrancisItineraryComponent,
    PopeFrancisQuotesComponent,
    PopeFrancisVideoComponent,
    PopeFrancisBibliographyComponent,
    InspirationalPage,
    DonationDrivePage,
    DonationDriveListPage,
    DonationDriveDetailPage,
    BfastPage,
    BfastChatPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthServiceProvider,
    GoogleMapsAPIWrapper,
    FileService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
