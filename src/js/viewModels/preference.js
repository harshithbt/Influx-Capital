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
define(["knockout", "../accUtils", "ojs/ojavatar", "ojs/ojformlayout", "ojs/ojinputtext", "ojs/ojbutton", "ojs/ojdialog", "ojs/ojfilepicker", "ojs/ojprogress-bar", "../firebasejs/firebase-app", "../firebasejs/firebase-auth", "../firebasejs/firebase-storage"],
  function (ko, accUtils) {
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
        var ddUserRole = firebase.database().ref("users/" + this.uid());
        var database = firebase.database();
        var database_ref = database.ref();
        ddUserRole.on("value", (snapshot) => {
          if (snapshot.exists()) {
            var resp = snapshot.val();
            var user_data = {
              email: resp.email,
              role: resp.role,
              phone: this.phoneNumber(),
              proPicUrl: resp.proPicUrl,
              last_login: resp.last_login
            }
            database_ref.child('users/' + this.uid()).set(user_data);
            rvm.hideLoader();
            rvm.messagesInfo(rvm.getMessagesData("confirmation", "Phone Number", "Updated Successfully"));
          }
        });
      };

      this.updateProfilePicButton = () => {
        this.fileName("");
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
          this.fileName(file.name);
          var file = files[0];
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
                var ddUserRole = firebase.database().ref("users/" + this.uid());
                var database = firebase.database();
                var database_ref = database.ref();
                ddUserRole.on("value", (snapshot) => {
                  if (snapshot.exists()) {
                    var resp = snapshot.val();
                    var user_data = {
                      email: resp.email,
                      role: resp.role,
                      phone: resp.phone,
                      proPicUrl: downloadURL,
                      last_login: resp.last_login
                    }
                    database_ref.child('users/' + this.uid()).set(user_data);
                  }
                });
                document.getElementById("uploadProPic").close();
                rvm.messagesInfo(rvm.getMessagesData("confirmation", "Profile Picture", "Uploaded Successfully"));
              });
            }
          );
        }
      };

      this.selectListener = (event) => {
        this.uploadEvent(event);
      };

      this.connected = () => {
        accUtils.announce('Preference page loaded.', 'assertive');
        document.title = "IC | Preference";
        rvm.headerFooterCond("");
        this.getCurrentUser();
        if (!rvm.isLogin()) {
          params.router.go({ path: 'login' });
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
    return PreferenceViewModel;
  }
);
