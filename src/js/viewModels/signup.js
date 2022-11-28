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
define(["knockout", "firebase", "../accUtils", "../icUtils/cookie", "../icUtils/icutility", "ojs/ojcorerouter", "ojs/ojarraydataprovider", "ojs/ojconverterutils-i18n", "ojs/ojasyncvalidator-regexp", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojbutton", "ojs/ojvalidationgroup", "ojs/ojmessages", "ojs/ojtrain", "ojs/ojgauge"],
    function (ko, firebase, accUtils, cookie, icUtils, CoreRouter, ArrayDataProvider, ojconverterutils_i18n_1, AsyncRegExpValidator) {
        function SignupViewModel(params) {
            const rvm = ko.dataFor(document.getElementById("pageContent"));
            this.emailAddress = ko.observable();
            this.password = ko.observable();
            this.firstName = ko.observable();
            this.lastName = ko.observable();
            this.phoneNumber = ko.observable();
            this.isLogin = rvm.isLogin;
            this.forEmail = ko.observable();
            this.selectedStepValue = ko.observable("stp1");
            this.selectedStepLabel = ko.observable("Email");
            this.selectedStepFormLabel = ko.observable("Please fill in your full name");
            this.isFormReadonly = ko.observable(false);
            this.progressBarValue = ko.observable(0);
            this.passwordStrengthDetail = ko.observable("Password strength");
            // this.entries = document.querySelectorAll("#listing span.demo-icon");
            this.stepArray = ko.observableArray([
                { label: "Email and Password", id: "stp1" },
                { label: "Personal Details", id: "stp2" },
                { label: "SignUp", id: "stp3" }
            ]);

            this.keyupHandlerPassword = () => {
                document.getElementById("singupPassword").validate();
            };

            this.emailPatternValidator = ko.observableArray([
                new AsyncRegExpValidator({
                    pattern: "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
                    hint: "enter a valid email format",
                    messageDetail: "Not a valid email format",
                }),
            ]);


            this.updateLabelText = (event) => {
                var train = document.getElementById("signuptrain");
                let selectedStep = train.getStep(event.detail.value);
                if (selectedStep != null) {
                    this.selectedStepLabel(selectedStep.label);
                }
                if (selectedStep != null && selectedStep.id == "stp1") {
                    this.selectedStepFormLabel("Please fill in Email and Password");
                    this.isFormReadonly(false);
                }
                else if (selectedStep != null && selectedStep.id == "stp2") {
                    this.selectedStepFormLabel("Please fill in your personal details");
                    this.isFormReadonly(false);
                }
                else {
                    this.selectedStepFormLabel("");
                    this.isFormReadonly(true);
                }
            };

            this.confirm = (event) => {
                var train = document.getElementById("signuptrain");
                let finalStep = train.getStep("stp3");
                //The final step will have a confirmation message type icon
                if (finalStep != null) {
                    finalStep.messageType = "SignUp";
                    train.updateStep(finalStep.id, finalStep);
                }
            };

            this.nextAc = () => {
                var train = document.getElementById("signuptrain");
                train.selectedStep = train.getNextSelectableStep();
            }

            this.previousAc = () => {
                var train = document.getElementById("signuptrain");
                train.selectedStep = train.getPreviousSelectableStep();
            }

            this.loginNavigateAc = () => {
                // params.router.go({ path: 'login' });
                params.router.go({ path: 'login' });
            }

            this.validateTrain = (event) => {
                let nextStep = event.detail.toStep;
                let previousStep = event.detail.fromStep;
                var tracker = document.getElementById("tracker");
                if (tracker == null) {
                    return;
                }
                var train = document.getElementById("signuptrain");
                if (tracker.valid === "valid") {
                    //The previous step will have a confirmation message type icon
                    previousStep.messageType = "confirmation";
                    train.updateStep(previousStep.id, previousStep);
                    //Now the clicked step could be selected
                    this.selectedStepValue(nextStep.id);
                    return;
                }
                else {
                    //The ojBeforeSelect can be cancelled by calling event.preventDefault().
                    event.preventDefault();
                    //The previous step will have an error message type icon
                    previousStep.messageType = "error";
                    train.updateStep(previousStep.id, previousStep);
                    // show messages on all the components
                    // that have messages hidden.
                    setTimeout(function () {
                        tracker.showMessages();
                        tracker.focusOn("@firstInvalidShown");
                    }, 0);
                    return;
                }
            };


            this.signUpButton = () => {
                rvm.showLoader();
                firebase.auth().createUserWithEmailAndPassword(this.emailAddress(), this.password())
                    .then((userCredential) => {
                        var user = userCredential.user;
                        var database = firebase.database();
                        var database_ref = database.ref()
                        // Create User data
                        var user_data = {
                            email: user.email,
                            role: "new",
                            phone: this.phoneNumber() || "",
                            proPicUrl: "",
                            name: this.setUserNameVal(this.firstName(), this.lastName()),
                            title: "",
                            last_login: "",
                            last_logout: "",
                            darkTheme: false,
                            uid: user.uid
                        }
                        database_ref.child('users/' + user.uid).set(user_data);
                        this.emailAddress("");
                        this.password("");
                        this.firstName("");
                        this.lastName("");
                        this.phoneNumber("");
                        rvm.hideLoader();
                        rvm.messagesInfo(rvm.getMessagesData("confirmation", "User Created", user.email + " user created successfully\n Please login with same credentials"));
                        params.router.go({ path: 'login', params: { email: user.email } });
                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        rvm.hideLoader();
                        rvm.messagesInfo(rvm.getMessagesData("error", errorCode.split("/")[1], errorMessage));
                    });
            };

            this.setUserNameVal = (fname, lname) => {
                var fullName = "";
                fullName = fname.trim() + " " + lname.trim();
                firebase.auth()
                    .currentUser
                    .updateProfile({
                        displayName: fullName
                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        rvm.hideLoader();
                        rvm.messagesInfo(rvm.getMessagesData("error", errorCode.split("/")[1], errorMessage));
                    });
                return fullName;
            };

            this.passValidator = {
                validate: (val) => {
                    let entries = document.querySelectorAll("#listing span.demo-icon");
                    let regExp = [/^.*[A-Z].*$/, /^.*[0-9].*$/, /^.*[!@#$%^&*].*$/, /^.{8,20}$/], progress = 0, passedIndices = {}; //can't use model since within keyup the value hasn't been updated yet
                    for (let i = 0, j = regExp.length; i < j; i++) {
                        if (regExp[i].test(val)) {
                            progress += 33;
                            passedIndices[i] = true;
                        }
                    }
                    if (progress <= 33) {
                        // means less than two pass
                        this.passwordStrengthDetail("password strength is poor");
                    }
                    else if (progress === 99) {
                        // means all pass
                        progress = 100;
                        this.passwordStrengthDetail("password strength is great");
                    }
                    else {
                        this.passwordStrengthDetail("password strength is good");
                    }
                    this.progressBarValue(progress);
                    // First, set all of the icons to error
                    for (let i = 0; i < entries.length; i++) {
                        entries[i].classList.remove("oj-ux-ico-check");
                        entries[i].classList.add("demo-icon-bullet");
                        entries[i].classList.add("oj-typography-body-lg");
                        entries[i].style.color = "";
                    }
                    // Now, for all passed password rules, set the icon to confirmation
                    for (let passed in passedIndices) {
                        entries[passed].classList.remove("demo-icon-bullet");
                        entries[passed].classList.remove("oj-typography-body-lg");
                        entries[passed].classList.add("oj-ux-ico-check");
                        entries[passed].style.color = "#759C6C";
                    }
                    const messagesElem = document.getElementById("messages");
                    if (progress === 100) {
                        messagesElem.classList.remove("demo-invalidShown");
                    }
                    else {
                        messagesElem.classList.add("demo-invalidShown");
                    }
                    if (val && progress < 100) {
                        throw new Error("Should meet the below criteria");
                    }
                    return;
                }
            };

            this.connected = () => {
                accUtils.announce('Signup page loaded.', 'assertive');
                document.title = "IC | Signup";
                rvm.headerFooterCond("signup");
                rvm.hideLoader();
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
        return SignupViewModel;
    }
);
