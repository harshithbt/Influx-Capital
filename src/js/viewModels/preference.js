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
define(["knockout", "firebase", "../accUtils", "../icUtils/cookie", "ojs/ojarraydataprovider", "ojs/ojavatar", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojbutton", "ojs/ojdialog", "ojs/ojfilepicker", "ojs/ojprogress-bar"],
  function (ko, firebase, accUtils, cookie, ArrayDataProvider) {
    function PreferenceViewModel(params) {
      const rvm = ko.dataFor(document.getElementById("pageContent"));
      this.emailAddress = rvm.userEmail;
      this.userName = rvm.displayName;
      this.phoneNumber = rvm.phoneNumber;
      this.photoUrl = rvm.userImage;
      this.userInitial = rvm.userInitial;
      this.smScreen = rvm.smScreen;
      this.userRole = rvm.userRole;
      this.acceptArr = ko.observableArray(["image/*"]);
      this.fileName = ko.observable();
      this.uid = ko.observable();
      this.uploadEvent = ko.observable();
      this.progressValue = ko.observable(0);
      this.invalidMessage = ko.observable("");
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
      this.getCurrentUser = () => {
        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            this.uid(user.uid);
            this.userName(user.displayName || "");
          } else {
            // User is signed out
            // ...
          }
        });
      };



      this.updateUserNameButton = () => {
        const user = firebase.auth().currentUser;
        rvm.showLoader();
        user.updateProfile({
          displayName: this.userName() || ""
        }).then(() => {
          this.userName(user.displayName || "");
          var database = firebase.database();
          var database_ref = database.ref();
          database_ref.child('users/' + this.uid() + '/name').set(this.userName() || "");
          rvm.hideLoader();
          rvm.messagesInfo(rvm.getMessagesData("confirmation", "User Name", "Updated Successfully"));
        }).catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          rvm.hideLoader();
          rvm.messagesInfo(rvm.getMessagesData("error", errorCode.split("/")[1], errorMessage));
        });
      };

      this.updatePhoneNumberButton = () => {
        rvm.showLoader();
        var database = firebase.database();
        var database_ref = database.ref();
        database_ref.child('users/' + this.uid() + '/phone').set(this.phoneNumber());
        rvm.phoneNumber(this.phoneNumber());
        rvm.hideLoader();
        rvm.messagesInfo(rvm.getMessagesData("confirmation", "Phone Number", "Updated Successfully"));
      };

      this.updateProfilePicButton = () => {
        this.fileName("");
        this.invalidMessage("");
        this.uploadEvent("");
        this.progressValue(0)
        document.getElementById("uploadProPic").open();
      };

      this.proPicCancel = () => {
        document.getElementById("uploadProPic").close();
      };

      this.proPicAC = () => {
        if (this.uploadEvent()) {
          var eventStored = this.uploadEvent();
          const user = firebase.auth().currentUser;
          const files = eventStored.detail.files;
          var file = files[0];
          var orginalFName = file.name;
          orginalFName = orginalFName.split('.').pop();
          var genaratedFileName = this.uid() + "." + orginalFName;
          var storageRef = firebase.storage().ref('img/' + genaratedFileName);
          var task = storageRef.put(file);
          task.on('state_changed',
            (snapshot) => {
              // Observe state change events such as progress, pause, and resume
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              this.progressValue(progress);
              console.log('Upload is ' + progress + '% done');
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  console.log('Upload is paused');
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  console.log('Upload is running');
                  break;
              }
            },
            (error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
              document.getElementById("uploadProPic").close();
              rvm.messagesInfo(rvm.getMessagesData("error", errorCode.split("/")[1], errorMessage));
            },
            () => {
              // Handle successful uploads on complete
              // For instance, get the download URL: https://firebasestorage.googleapis.com/...
              task.snapshot.ref.getDownloadURL().then((downloadURL) => {
                rvm.userImage(downloadURL);
                var database = firebase.database();
                var database_ref = database.ref();
                database_ref.child('users/' + this.uid() + '/proPicUrl').set(downloadURL);
                document.getElementById("uploadProPic").close();
                rvm.messagesInfo(rvm.getMessagesData("confirmation", "Profile Picture", "Uploaded Successfully"));
              });
            }
          );
        }
      };

      this.selectListener = (event) => {
        this.uploadEvent(event);
        const files = event.detail.files;
        var file = files[0];
        this.fileName(file.name);
        this.invalidMessage("");
      };

      this.invalidListener = (event) => {
        this.fileName("");
        this.invalidMessage(event.detail.messages[0].severity + " :" + event.detail.messages[0].summary);
        const promise = event.detail.until;
        if (promise) {
          promise.then(() => {
            this.invalidMessage("");
          });
        }
      };


      this.beforeSelectListener = (event) => {
        const accept = event.detail.accept;
        const files = event.detail.files;
        const messages = [];
        let file;
        const invalidFiles = [];
        for (let i = 0; i < files.length; i++) {
          file = files[i];
          if (file.size > 100000) {
            invalidFiles.push(file.name);
          }
        }
        if (invalidFiles.length === 0) {
          accept(Promise.resolve());
        }
        else {
          if (invalidFiles.length === 1) {
            messages.push({
              severity: "Error",
              summary: "File " +
                invalidFiles[0] +
                " is too big.  The maximum size is 100kb.",
            });
          }
          else {
            const fileNames = invalidFiles.join(", ");
            messages.push({
              severity: "Error",
              summary: "These files are too big: " +
                fileNames +
                ".  The maximum size is 100kb.",
            });
          }
          accept(Promise.reject(messages));
        }
      };

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
        accUtils.announce('Preference page loaded.', 'assertive');
        document.title = "IC | Preference";
        rvm.headerFooterCond("");
        this.getCurrentUser();
        rvm.hideLoader();
        if (!rvm.isLogin() && !rvm.getUID()) {
          params.router.go({ path: 'login' });
        } else if (!this.userRole()) {
          this.getDetails();
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
    return PreferenceViewModel;
  }
);
