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
define(["knockout", "../accUtils", "firebase", "../icUtils/cookie", "../icUtils/icutility", "ojs/ojcorerouter", "ojs/ojarraydataprovider", "ojs/ojconverterutils-i18n", "ojs/ojasyncvalidator-regexp", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojbutton", "ojs/ojvalidationgroup", "ojs/ojmessages", "ojs/ojdialog"],
    function (ko, accUtils, firebase, cookie, icUtils, CoreRouter, ArrayDataProvider, ojconverterutils_i18n_1, AsyncRegExpValidator) {
        function LoginViewModel(params) {
            const rvm = ko.dataFor(document.getElementById("pageContent"));
            this.emailAddress = ko.observable();
            this.password = ko.observable();
            this.isLogin = rvm.isLogin;
            this.forEmail = ko.observable();


            this.emailPatternValidator = ko.observableArray([
                new AsyncRegExpValidator({
                    pattern: "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
                    hint: "enter a valid email format",
                    messageDetail: "Not a valid email format",
                }),
            ]);


            this.loginButton = () => {
                const tracker = document.getElementById("trackerLogin");
                rvm.showLoader();
                if (tracker.valid === "valid") {
                    firebase.auth().signInWithEmailAndPassword(this.emailAddress(), this.password())
                        .then((userCredential) => {
                            var disName = this.emailAddress().split("@")[0];
                            var user = userCredential.user;
                            if (user.displayName) {
                                disName = user.displayName.replace(/\s/g, '');
                            }
                            rvm.userEmail(user.email);
                            rvm.userName(disName);
                            rvm.userInitial(ojconverterutils_i18n_1.IntlConverterUtils.getInitials(disName));
                            rvm.isLogin(true);
                            rvm.uid(userCredential.uid);
                            // rvm.userImage(user.photoURL || "");
                            rvm.displayName(user.displayName || "");
                            // rvm.phoneNumber(user.phoneNumber || "");
                            this.emailAddress("");
                            this.password("");
                            cookie.createUserCookie(user.email, disName, icUtils.generateRandomString(), ojconverterutils_i18n_1.IntlConverterUtils.getInitials(disName), user.uid);
                            const userData = {
                                userName: user.displayName || "",
                                profile_picture: user.photoURL || "",
                                fullName: user.displayName || "",
                                email: user.email || "",
                                uid: user.uid || ""
                            }
                            localStorage.setItem("user", JSON.stringify(userData));
                            var database = firebase.database();
                            var database_ref = database.ref();
                            database_ref.child('users/' + userCredential.uid + '/last_login').set(ojconverterutils_i18n_1.IntlConverterUtils.dateToLocalIso(new Date()));
                            rvm.hideLoader();
                            params.router.go({ path: 'home' });
                        })
                        .catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            rvm.hideLoader();
                            rvm.messagesInfo(rvm.getMessagesData("error", errorCode.split("/")[1], errorMessage));
                        });
                }
                else {
                    tracker.showMessages();
                    tracker.focusOn("@firstInvalidShown");
                    rvm.hideLoader();
                    return false;
                }
            };

            this.signInWithGoogle = () => {
                rvm.showLoader();
                var provider = new firebase.auth.GoogleAuthProvider();

                firebase.auth()
                    .signInWithPopup(provider)
                    .then((result) => {
                        var gUser = result.user;
                        rvm.userEmail(gUser.email);
                        rvm.userName(gUser.displayName.replace(/\s/g, ''));
                        rvm.isLogin(true);
                        rvm.userImage(gUser.photoURL);
                        // rvm.displayName(gUser.displayName);
                        rvm.phoneNumber(gUser.phoneNumber);
                        cookie.createUserCookie(gUser.email, gUser.displayName.replace(/\s/g, ''), icUtils.generateRandomString(), ojconverterutils_i18n_1.IntlConverterUtils.getInitials(gUser.displayName), gUser.uid);
                        rvm.hideLoader();
                        params.router.go({ path: 'home' });
                    }).catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        var email = error.email;
                        var credential = error.credential;
                        rvm.hideLoader();
                        rvm.messagesInfo(rvm.getMessagesData("error", errorCode.split("/")[1], errorMessage));
                    });
            };

            this.signUpButton = () => {
                params.router.go({ path: 'signup' });
            };


            this.forgotPasswordOpen = () => {
                document.getElementById("forgotPassword").open();
            };

            this.forgotPasswordClose = () => {
                document.getElementById("forgotPassword").close();
            };

            this.forgotPasswordAC = () => {
                const tracker = document.getElementById("trackerFor");
                if (tracker.valid === "valid") {
                    firebase.auth().sendPasswordResetEmail(this.forEmail())
                        .then((result) => {
                            rvm.messagesInfo(rvm.getMessagesData("confirmation", "Mail Sent", "Password reset email sent to " + this.forEmail()));
                            document.getElementById("forgotPassword").close();
                        })
                        .catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            rvm.messagesInfo(rvm.getMessagesData("error", errorCode.split("/")[1], errorMessage));
                        });
                } else {
                    tracker.showMessages();
                    tracker.focusOn("@firstInvalidShown");
                    return false;
                }
            };

            this.connected = () => {
                accUtils.announce('Login page loaded.', 'assertive');
                document.title = "IC | Login";
                rvm.headerFooterCond("login");
                rvm.hideLoader();
                this.emailAddress(params.router._activeState.params.email || "");
                if (rvm.isLogin() && rvm.getUID()) {
                    params.router.go({ path: 'home' });
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
        return LoginViewModel;
    }
);
