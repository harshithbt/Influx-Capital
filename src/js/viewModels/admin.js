/**
 * @license
 * Copyright (c) 2014, 2022, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(["../accUtils", "../services", "require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider", "ojs/ojlistdataproviderview", "ojs/ojdataprovider", "ojs/ojconverterutils-i18n",
    "ojs/ojknockout", "ojs/ojtable", "ojs/ojinputtext", "ojs/ojbutton", "ojs/ojdialog", "ojs/ojformlayout", "ojs/ojvalidationgroup", "ojs/ojmessages", "ojs/ojselectsingle", "ojs/ojdatetimepicker", "../firebasejs/firebase-app", "../firebasejs/firebase-auth", "../firebasejs/firebase-database"],
    function (accUtils, services, require, exports, ko, ojbootstrap_1, ArrayDataProvider, ListDataProviderView, ojdataprovider_1, ojconverterutils_i18n_1) {
        function AdminViewModel(params) {
            const rvm = ko.dataFor(document.getElementById("pageContent"));

            this.baseUserArray = ko.observable();
            this.userArray = ko.observableArray();
            this.UID = ko.observable();
            this.email = ko.observable();
            this.last_login = ko.observable();
            this.phone = ko.observable();
            this.proPicUrl = ko.observable();
            this.role = ko.observable();
            this.isLogin = rvm.isLogin;
            this.userRole = rvm.userRole;
            this.smScreen = rvm.smScreen;
            this.loggedUserUid = rvm.uid;

            this.ROLEARRAY = ko.observableArray();
            this.dataProviderRole = new ArrayDataProvider(this.ROLEARRAY, {
                keyAttributes: "value",
            });

            this.refreshUser = () => {
                rvm.showLoader();
                const dbRef = firebase.database().ref("users");
                dbRef.on("value", (snapshot) => {
                    if (snapshot.exists()) {
                        var resp = snapshot.val();
                        var result = Object.keys(resp).map((key) => [key, resp[key]]);
                        this.baseUserArray(result);
                        this.userArray(this.generateUserArray(1000));
                        this.createOptionsArray();
                        rvm.hideLoader();
                    } else {
                        rvm.messagesInfo(rvm.getMessagesData("error", "Error", "No data available"));
                        rvm.hideLoader();
                    }
                });
            };

            this.filter = ko.observable('');
            this.generateUserArray = (num) => {
                const userArray = [];
                this.baseUserArray().forEach((user, index) => {
                    userArray.push({
                        UID: user[0],
                        email: user[1].email,
                        last_login: user[1].last_login,
                        phone: user[1].phone,
                        proPicUrl: user[1].proPicUrl,
                        role: user[1].role
                    });
                });
                return userArray;
            };

            this.dataprovider = ko.computed(function () {
                let filterCriterion = null;
                if (this.filter() && this.filter() != '') {
                    filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
                        filterDef: { text: this.filter() }
                    });
                }
                const arrayDataProvider = new ArrayDataProvider(this.userArray(), { keyAttributes: 'UID' });
                return new ListDataProviderView(arrayDataProvider, { filterCriterion: filterCriterion });
            }, this);


            this.handleValueChanged = () => {
                this.filter(document.getElementById('filter').rawValue);
            };


            this.highlightingCellRenderer = (context) => {
                let field = null;

                if (context.columnIndex === 1) {
                    field = 'email';
                }
                else if (context.columnIndex === 2) {
                    field = 'last_login';
                }
                else if (context.columnIndex === 3) {
                    field = 'phone';
                }
                else if (context.columnIndex === 4) {
                    field = 'role';
                }
                let data = "";
                if (context.columnIndex <= 4 && context.columnIndex != 0) {
                    data = context.row[field].toString();
                }

                const filterString = this.filter();
                let textNode;
                let spanNode = document.createElement('span');
                if (filterString && filterString.length > 0) {
                    const index = data.toLowerCase().indexOf(filterString.toLowerCase());
                    if (index > -1) {
                        const highlightedSegment = data.substr(index, filterString.length);
                        if (index !== 0) {
                            textNode = document.createTextNode(data.substr(0, index));
                            spanNode.appendChild(textNode);
                        }
                        let bold = document.createElement('b');
                        textNode = document.createTextNode(highlightedSegment);
                        bold.appendChild(textNode);
                        spanNode.appendChild(bold);
                        if (index + filterString.length !== data.length) {
                            textNode = document.createTextNode(data.substr(index + filterString.length, data.length - 1));
                            spanNode.appendChild(textNode);
                        }
                    }
                    else {
                        textNode = document.createTextNode(data);
                        spanNode.appendChild(textNode);
                    }
                }
                else {
                    textNode = document.createTextNode(data);
                    spanNode.appendChild(textNode);
                }
                context.parentElement.appendChild(spanNode);
            };

            this.columnArray = [
                { headerText: 'Profile Picture', template: 'proTemplate', id: 'proPicUrl' },
                { headerText: 'Email', renderer: this.highlightingCellRenderer, id: 'email' },
                { headerText: 'Last Login', id: 'last_login', template: 'loginCellTemplate' },
                { headerText: 'Phone Number', renderer: this.highlightingCellRenderer, id: 'phone' },
                { headerText: 'User Role', renderer: this.highlightingCellRenderer, id: 'role' },
                { headerText: 'ACTIONS', template: 'editCellTemplate', id: 'Actions' }
            ];


            this.editUser = (event, context) => {
                this.clearUser();
                this.UID(context.item.data.UID);
                this.email(context.item.data.email);
                this.last_login(context.item.data.last_login);
                this.phone(context.item.data.phone);
                this.proPicUrl(context.item.data.proPicUrl);
                this.role(context.item.data.role);
                document.getElementById("editUser").open();
            };


            this.editUserCancel = () => {
                document.getElementById("editUser").close();
            };

            this.editUserAC = (event) => {
                var postData = {
                    "email": this.email(),
                    "last_login": this.last_login(),
                    "phone": this.phone(),
                    "proPicUrl": this.proPicUrl(),
                    "role": this.role()
                };
                rvm.showLoader();
                const tracker = document.getElementById("trackerEdit");
                if (tracker.valid === "valid") {
                    var database = firebase.database();
                    var database_ref = database.ref()
                    database_ref.child('users/' + this.UID()).set(postData);
                    document.getElementById("editUser").close();
                    rvm.messagesInfo(rvm.getMessagesData("confirmation", "User", "Edited Successfully"));
                    rvm.hideLoader();
                }
                else {
                    tracker.showMessages();
                    tracker.focusOn("@firstInvalidShown");
                    rvm.hideLoader();
                    return false;
                }
            };

            this.clearUser = () => {
                this.UID("");
                this.email("");
                this.last_login("");
                this.phone("");
                this.proPicUrl("");
                this.role("");
            };


            this.createOptionsArray = () => {
                var browsers = [
                    { value: "superadmin", label: "Super Admin" },
                    { value: "admin", label: "Admin" },
                    { value: "user", label: "User" },
                    { value: "new", label: "New" }
                ];
                this.ROLEARRAY(browsers);
            };

            this.photoUrl = (event) => {
                var url = ""
                if (event.row.proPicUrl) {
                    url = event.row.proPicUrl
                }
                return url;

            };

            this.userInitial = (event) => {
                var disName = event.row.email.split("@")[0];
                var initial = ojconverterutils_i18n_1.IntlConverterUtils.getInitials(disName);
                if (event.row.proPicUrl) {
                    initial = ""
                }
                return initial;

            };

            this.deleteUserPop = (event, context) => {
                this.clearUser();
                this.UID(context.item.data.UID);
                document.getElementById("deleteUser").open();
            };

            this.deleteUserAC = () => {
                rvm.showLoader();
                var user = firebase.auth().getUser(this.UID());
                user.delete()
                    .then(() => {
                        var database = firebase.database();
                        var database_ref = database.ref();
                        database_ref.child('users/' + this.UID()).remove();
                        rvm.messagesInfo(rvm.getMessagesData("confirmation", "User " + this.UID(), "Deleted Successfully"));
                        rvm.hideLoader();
                        document.getElementById("deleteUser").close();
                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        rvm.hideLoader();
                        document.getElementById("deleteUser").close();
                        rvm.messagesInfo(rvm.getMessagesData("error", errorCode.split("/")[1], errorMessage));
                    });
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
                accUtils.announce('Amin page loaded.', 'assertive');
                document.title = "IC | Admin";
                rvm.headerFooterCond("");
                if (!rvm.isLogin()) {
                    params.router.go({ path: 'login' });
                }
                if (this.userRole() !== 'new') {
                    this.refreshUser();
                }
            };

            /**
             * Optional ViewModel method invoked after the View is disconnected from the DOM.
             */
            this.disconnected = () => {
                // Implement if needed
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
        return AdminViewModel;
    }
);
