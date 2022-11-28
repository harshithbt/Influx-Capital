/**
 * @license
 * Copyright (c) 2014, 2022, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your about ViewModel code goes here
 */
define(["knockout", "../accUtils", "../icUtils/cookie", "firebase"],
  function (ko, accUtils, cookie, firebase) {
    function HomeViewModel(params) {
      const rvm = ko.dataFor(document.getElementById("pageContent"));
      this.smScreen = rvm.smScreen;
      this.userRole = rvm.userRole;
      this.userImage = rvm.userImage;
      this.phoneNumber = rvm.phoneNumber;
      this.isContrastBackground = rvm.isContrastBackground;
      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */

      this.getDetails = () => {
        var uid = cookie.getUserCookieArray()[5] || "";
        var ddUserRole = firebase.database().ref("users/" + uid);
        ddUserRole.on("value", (snapshot) => {
          if (snapshot.exists()) {
            var resp = snapshot.val();
            rvm.userImage(resp.proPicUrl);
            rvm.userRole(resp.role);
            rvm.phoneNumber(resp.phone);
            rvm.isContrastBackground(resp.darkTheme);
          }
        });
      };


      this.connected = () => {
        accUtils.announce('About page loaded.', 'assertive');
        document.title = "IC | Home";
        rvm.headerFooterCond("");
        rvm.hideLoader();
        if (!rvm.isLogin() && !rvm.getUID()) {
          params.router.go({ path: 'login' });
        } else if (!this.userRole()) {
          this.getDetails();
        }
        if (firebase.auth().currentUser && !firebase.auth().currentUser.displayName) {
          document.getElementById("naviGatePref").open();
        }
      };

      /**
       * Optional ViewModel method invoked after the View is disconnected from the DOM.
       */
      this.disconnected = () => {
        rvm.showLoader();
      };

      /**
       * Optional ViewModel method invoked after transition to the new View is complete.
       * That includes any possible animation between the old and the new View.
       */
      this.transitionCompleted = () => {
        // Implement if needed
      };
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return HomeViewModel;
  }
);
