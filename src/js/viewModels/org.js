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
define(["knockout", "../accUtils", "../components/demo-card/loader"],
    function (ko, accUtils) {
        function OrgViewModel(params) {
            const rvm = ko.dataFor(document.getElementById("pageContent"));
            this.smScreen = rvm.smScreen;
            this.baseUserArray = ko.observableArray();
            this.userArray = ko.observableArray();


            this.refreshUser = () => {
                rvm.showLoader();
                const dbRef = firebase.database().ref("users");
                dbRef.on("value", (snapshot) => {
                    if (snapshot.exists()) {
                        var resp = snapshot.val();
                        var result = Object.keys(resp).map((key) => [key, resp[key]]);
                        this.baseUserArray(result);
                        this.userArray(this.generateUserArray());
                        rvm.hideLoader();
                    } else {
                        rvm.messagesInfo(rvm.getMessagesData("error", "Error", "No data available"));
                        rvm.hideLoader();
                    }
                });
            };

            this.generateUserArray = () => {
                const userArray = [];
                this.baseUserArray().forEach((user, index) => {
                    userArray.push({
                        name: user[1].name,
                        email: user[1].email,
                        title: user[1].title,
                        work: user[1].phone,
                        avatar: user[1].proPicUrl
                    });
                });
                return userArray;
            };
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
            this.connected = () => {
                accUtils.announce('Organization page loaded.', 'assertive');
                document.title = "IC | Organization";
                this.refreshUser();
                rvm.headerFooterCond("");
                rvm.hideLoader();
                if (!rvm.isLogin()) {
                    params.router.go({ path: 'login' });
                }
            };

            /**
             * Optional ViewModel method invoked after the View is disconnected from the DOM.
             */
            this.disconnected = () => {
                // Implement if needed
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
        return OrgViewModel;
    }
);
