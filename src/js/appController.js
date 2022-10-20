/**
 * @license
 * Copyright (c) 2014, 2022, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'jquery', 'ojs/ojcontext', 'firebasejs/cookie', 'firebasejs/icutility', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider', "ojs/ojmessages", "ojs/ojprogress-circle", "ojs/ojdialog", "ojs/ojavatar", "firebasejs/firebase-app", "firebasejs/firebase-auth", "firebasejs/firebase-database",
  'ojs/ojdrawerpopup', 'ojs/ojmodule-element', 'ojs/ojknockout'],
  function (ko, $, Context, cookie, icUtils, moduleUtils, KnockoutTemplateUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider) {

    function ControllerViewModel(params) {


      this.KnockoutTemplateUtils = KnockoutTemplateUtils;

      // Handle announcements sent when pages change, for Accessibility.
      this.manner = ko.observable('polite');
      this.message = ko.observable();
      this.sessionId = ko.observable(cookie.getUserCookieArray()[1] || "");
      this.isLogin = ko.observable(cookie.getUserCookieArray().length > 1 || false);
      this.userEmail = ko.observable(cookie.getUserCookieArray()[3] || "");
      this.userName = ko.observable(cookie.getUserCookieArray()[2] || "");
      this.userInitial = ko.observable(cookie.getUserCookieArray()[4] || "");
      this.uid = ko.observable(cookie.getUserCookieArray()[5] || "");
      this.userImage = ko.observable();
      this.userRole = ko.observable();
      this.phoneNumber = ko.observable();
      this.displayName = ko.observable();

      this.getMessagesData = (type, sum, message) => {
        return [
          {
            severity: type,
            summary: sum,
            detail: message,
            autoTimeout: 5000
          }
        ];
      };


      this.messagesInfo = ko.observableArray();
      this.messagesDataprovider = new ArrayDataProvider(this.messagesInfo);



      // Your web app's Firebase configuration
      // For Firebase JS SDK v7.20.0 and later, measurementId is optional
      const firebaseConfig = {
        apiKey: "AIzaSyCR_UfcFNlRHgtjyBX-Wn3HQFkfFUs9KrU",
        authDomain: "influx-capital.firebaseapp.com",
        databaseURL: "https://influx-capital-default-rtdb.firebaseio.com",
        projectId: "influx-capital",
        storageBucket: "influx-capital.appspot.com",
        messagingSenderId: "609489391928",
        appId: "1:609489391928:web:689ca8fde590678ac2b1cd",
        measurementId: "G-6S97YHQEXC"
      };

      // Initialize Firebase
      const firebaseapp = firebase.initializeApp(firebaseConfig);

      this.getUserDetails = () => {
          if (this.uid() && this.isLogin()) {
            var ddUserRole = firebase.database().ref("users/" + this.uid());
            ddUserRole.on("value", (snapshot) => {
              if (snapshot.exists()) {
                var resp = snapshot.val();
                this.userImage(resp.proPicUrl);
                this.userRole(resp.role);
                this.phoneNumber(resp.phone);
              }
            });
          } else {
            router.go({ path: 'login' });
          }
      };

      announcementHandler = (event) => {
        this.message(event.detail.message);
        this.manner(event.detail.manner);
      };

      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);


      // Media queries for repsonsive layouts
      const smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      const mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

      let pagesData = [
        { path: '', redirect: 'login' },
        { path: 'home', detail: { label: 'Home' } },
        { path: 'customers', detail: { label: 'Customers' } },
        { path: 'about', detail: { label: 'About' } },
        { path: 'login', detail: { label: 'Login' } },
        { path: 'preference', detail: { label: 'Preference' } },
        { path: 'admin', detail: { label: 'Admin' } },
        { path: 'org', detail: { label: 'Organization' } }
      ];

      let navData = [
        { path: '', redirect: 'login' },
        { path: 'home', detail: { label: 'Home', iconClass: 'oj-ux-ico-home' } },
        { path: 'customers', detail: { label: 'Customers', iconClass: 'oj-ux-ico-contact-group' } },
        { path: 'about', detail: { label: 'About', iconClass: 'oj-ux-ico-information-s' } }
      ];

      // Router setup
      let router = new CoreRouter(pagesData, {
        urlAdapter: new UrlParamAdapter()
      });
      router.sync();

      this.moduleAdapter = new ModuleRouterAdapter(router);

      this.selection = new KnockoutRouterAdapter(router);

      // Setup the navDataProvider with the routes, excluding the first redirected
      // route.
      this.navDataProvider = new ArrayDataProvider(navData.slice(1), { keyAttributes: "path" });

      // Drawer
      self.sideDrawerOn = ko.observable(false);

      // Close drawer on medium and larger screens
      this.mdScreen.subscribe(() => { self.sideDrawerOn(false) });

      // Called by navigation drawer toggle button and after selection of nav drawer item
      this.toggleDrawer = () => {
        self.sideDrawerOn(!self.sideDrawerOn());
      }


      this.logoutButton = () => {
        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signOut().then((result) => {
          this.userEmail("");
          this.userName("");
          this.isLogin(false);
          this.sessionId("");
          this.userInitial("");
          this.uid("");
          this.userImage("");
          this.userRole("");
          this.phoneNumber("");
          this.displayName("");
          cookie.deleteUserCookie();
          router.go({ path: 'login' });
        }).catch((error) => {
          console.log(error);
        });
      }

      this.menuActionAC = (event) => {
        if (event.detail.selectedValue === "out") {
          this.logoutButton();
        } else if (event.detail.selectedValue === "about") {
          router.go({ path: 'about' });
        } else if (event.detail.selectedValue === "help") {
          router.go({ path: 'help' });
        } else if (event.detail.selectedValue === "pref") {
          router.go({ path: 'preference' });
        } else if (event.detail.selectedValue === "admin") {
          router.go({ path: 'admin' });
        } else if (event.detail.selectedValue === "org") {
          router.go({ path: 'org' });
        }
      }

      this.showLoader = () => {
        $("#page-loader").css("display", "flex");
      };

      this.hideLoader = () => {
        $("#page-loader").hide();
      };

      this.headerFooterCond = (page) => {
        if (page === "login") {
          document.getElementById("mainHeader").style.display = "none";
          document.getElementById("mainFooter").style.display = "none";
          document.getElementById("icSideIcons").style.display = "none";
        } else {
          document.getElementById("mainHeader").style.display = "block";
          document.getElementById("mainFooter").style.display = "block";
          document.getElementById("icSideIcons").style.display = "block";
        }
      };

      this.callUsAction = () => {
        document.getElementById("call-us-dialog").open();
      }

      this.helpAction = () => {
        document.getElementById("help-dialog").open();
      }

      this.messageAction = () => {
        document.getElementById("message-dialog").open();
      }

      this.closeCallUs = () => {
        document.getElementById("call-us-dialog").close();
      }

      this.closeHelp = () => {
        document.getElementById("help-dialog").close();
      }

      this.closeMessage = () => {
        document.getElementById("message-dialog").close();
      }

      

      // Header
      // Application Name used in Branding Area
      this.appName = ko.observable("Influx Capital");
      // User Info used in Global Navigation area
      this.userLogin = ko.observable("influxcapitalmail@gmail.com");

      // Footer
      this.footerLinks = [
        { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
        { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
        { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
        { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
      ];
      this.getUserDetails();
    }
    // release the application bootstrap busy state
    Context.getPageContext().getBusyContext().applicationBootstrapComplete();

    return new ControllerViewModel();
  }
);
