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
define(['knockout', 'jquery', 'ojs/ojcontext', 'firebasejs/cookie', 'firebasejs/firebase-config', 'firebasejs/moment', 'emoji', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider', "ojs/ojknockout-keyset", "ojs/ojconverterutils-i18n", "ojs/ojfilepickerutils", "ojs/ojmessages", "ojs/ojinputtext", "ojs/ojprogress-circle", "ojs/ojdialog", "ojs/ojlistview", "ojs/ojlistitemlayout", "ojs/ojavatar", "ojs/ojpopup", "ojs/ojfilepicker", "firebasejs/firebase-app", "firebasejs/firebase-auth", "firebasejs/firebase-database",
  'ojs/ojdrawerpopup', 'ojs/ojmodule-element', 'ojs/ojknockout'],
  function (ko, $, Context, cookie, fConfig, moment, emoji, moduleUtils, KnockoutTemplateUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider, ojknockout_keyset_1, ojconverterutils_i18n_1, FilePickerUtils) {

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
      this.sendMessage = ko.observable();
      this.messageUser = ko.observableArray();
      this.messageUserDataProvider = ko.observable(new ArrayDataProvider(this.messageUser(), { keyAttributes: "uid" }));

      this.usersMessagesArray = ko.observableArray();
      this.messageArrayDataProvider = ko.observable(new ArrayDataProvider(this.usersMessagesArray(), { keyAttributes: "ID" }));

      this.messageUserSelectedItems = new ojknockout_keyset_1.ObservableKeySet();
      this.messageSelectedItems = new ojknockout_keyset_1.ObservableKeySet();

      this.firstSelectedItemMessage = ko.observable();
      this.deleteMessageVal = ko.observable();
      this.deleteOwner = ko.observable();


      this.userMessageSelected = ko.observableArray();
      this.firstSelectedItem = ko.observable();
      this.selectedUserName = ko.observable();
      this.optionSelectedMessageId = ko.observable();
      this.emojiOptionArray = ko.observableArray(emoji.emojis);
      this.scrollToKey = ko.observable("always");
      this.scrollPos = ko.observable({ y: 10000 });
      this.messageFileNames = ko.observable();



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
      // Initialize Firebase
      const firebaseapp = firebase.initializeApp(fConfig.firebaseConfig);
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
        var database = firebase.database();
        var database_ref = database.ref();
        database_ref.child('users/' + this.uid() + '/last_logout').set(ojconverterutils_i18n_1.IntlConverterUtils.dateToLocalIso(new Date()));

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


      this.getUID = () => {
        return firebase.auth().currentUser;
      }

      this.callUsAction = () => {
        document.getElementById("call-us-dialog").open();
      }

      this.helpAction = () => {
        document.getElementById("help-dialog").open();
      }

      this.messageAction = (event) => {
        console.log(event.target.id);
        const dbRef = firebase.database().ref("users");
        dbRef.on("value", (snapshot) => {
          if (snapshot.exists()) {
            var resp = snapshot.val();
            var result = Object.keys(resp).map((key) => [key, resp[key]]);
            this.messageUser([]);
            this.userMessageSelected([]);
            this.sendMessage("");
            this.usersMessagesArray([]);
            result.forEach((user) => {
              if (this.uid() !== user[0]) {
                this.messageUser().push({
                  uid: user[0],
                  name: user[1].name,
                  title: user[1].title,
                  image: user[1].proPicUrl,
                  email: user[1].email,
                  last_login: user[1].last_login,
                  last_logout: user[1].last_logout
                });
              }
            });
            this.messageUserDataProvider(new ArrayDataProvider(this.messageUser(), { keyAttributes: "uid" }));
            if(event.target.id){
              document.getElementById("message-dialog").open();
            }
          } else {
            rvm.messagesInfo(rvm.getMessagesData("error", "Error", "No data available"));
          }
        });
      }

      this.getSelectedUidMessage = (set) => {
        return JSON.stringify(Array.from(set.values()));
      }

      this.getSelectedUidMessageforDelete = (set) => {
        return JSON.stringify(Array.from(set.values()));
      }

      this.backToUsers = () => {
        this.userMessageSelected([]);
        this.usersMessagesArray([]);
        this.deleteMessageVal("");
        this.deleteOwner("");
      }

      this.closeCallUs = () => {
        document.getElementById("call-us-dialog").close();
      }

      this.closeHelp = () => {
        document.getElementById("help-dialog").close();
      }

      this.icChatAction = () => {
        document.getElementById("ic-chat-dialog").open();
      }

      this.sendMessageAc = () => {
        if (this.sendMessage()) {
          var userArry = [];
          userArry.push(this.uid());
          userArry.push(this.userMessageSelected().split('"')[1]);
          userArry.sort();
          var messageId = "";
          messageId = userArry.toString();
          const dbRef = firebase.database().ref().child('messages/' + messageId);
          var database = firebase.database();
          var database_ref = database.ref()
          var message_data = {
            uid: this.uid(),
            message: this.sendMessage(),
            messageType: "text",
            time: ojconverterutils_i18n_1.IntlConverterUtils.dateToLocalIso(new Date())
          }
          dbRef.push(message_data);
          this.sendMessage("");
          // var objDiv = document.getElementById("end-chat-refer");
          // objDiv.scrollTop = objDiv.scrollHeight;
        }
      }

      this.handleSelectedChangedMessageUser = () => {
        this.sendMessage("");
        this.usersMessagesArray([]);
        var friend = this.getSelectedUidMessage(this.messageUserSelectedItems());
        this.selectedUserName(this.firstSelectedItem().data.name || this.firstSelectedItem().data.email);
        var userArry = [];
        userArry.push(this.uid());
        userArry.push(friend.split('"')[1]);
        userArry.sort();
        var messageId = "";
        messageId = userArry.toString();

        const dbRef = firebase.database().ref().child('messages/' + messageId);
        dbRef.on("value", (snapshot) => {
          if (snapshot.exists()) {
            var messages = [];
            var lastId = "";
            var resp = snapshot.val();
            var result = Object.keys(resp).map((key) => [key, resp[key]]);
            result.forEach((user) => {
              messages.push({
                ID: user[0],
                message: user[1].message,
                sender: user[1].uid === this.uid() ? true : false,
                messageType: user[1].messageType,
                time: user[1].time
              });
              lastId = user[0];
            });
            this.usersMessagesArray(messages);
            this.messageArrayDataProvider(new ArrayDataProvider(this.usersMessagesArray(), { keyAttributes: "ID" }));
            this.userMessageSelected(friend);
            this.scrollPos({ y: 20000 });
            // var objDiv = document.getElementById(lastId);
            // objDiv.scrollTop = objDiv.scrollHeight;
          } else {
            this.userMessageSelected(friend);
          }
        });

      };

      this.messageTimeFormater = (d) => {
        var res = "";
        res = moment(d).fromNow();
        return res;
      }

      this.messageDeteleAC = () => {
        var idVal = event.currentTarget.id.split("~")[1];
        this.optionSelectedMessageId(idVal);
        var friend = this.getSelectedUidMessage(this.messageUserSelectedItems());
        this.selectedUserName(this.firstSelectedItem().data.name || this.firstSelectedItem().data.email);
        var userArry = [];
        userArry.push(this.uid());
        userArry.push(friend.split('"')[1]);
        userArry.sort();
        var messageId = "";
        messageId = userArry.toString();
        var database = firebase.database();
        var database_ref = database.ref().child('messages/' + messageId);
        database_ref.child(this.optionSelectedMessageId()).remove();
      }

      this.messageEditAC = () => {
        var idVal = event.currentTarget.id.split("~")[1];
        this.optionSelectedMessageId(idVal);
        document.getElementById("mes~" + idVal).setAttribute("readonly", false);
      }

      this.messageEditACValueChanged = (event) => {
        if (event.detail.updatedFrom === "internal") {
          var friend = this.getSelectedUidMessage(this.messageUserSelectedItems());
          this.selectedUserName(this.firstSelectedItem().data.name || this.firstSelectedItem().data.email);
          var userArry = [];
          userArry.push(this.uid());
          userArry.push(friend.split('"')[1]);
          userArry.sort();
          var messageId = "";
          messageId = userArry.toString();
          var database = firebase.database();
          var database_ref = database.ref().child('messages/' + messageId);
          database_ref.child(this.optionSelectedMessageId() + '/message').set(event.detail.value);
          document.getElementById("mes~" + this.optionSelectedMessageId()).setAttribute("readonly", true);
        }
      }

      this.checkMsgOption = (id, time) => {
        var now = new Date();
        var messageTime = new Date(time);
        var diffTime = now.getTime() - messageTime.getTime();
        var diffMins = Math.floor(diffTime / 60000);
        if (diffMins <= 5) {
          return true;
        } else {
          return false;
        }
      }

      this.checkLastDateGreater = (lnTime, loTime) => {
        var logedIn = new Date(lnTime);
        var logedOut = new Date(loTime);
        var diffTime = logedIn.getTime() - logedOut.getTime();
        var diffMins = Math.floor(diffTime / 60000);
        if (diffMins > 0) {
          return "Online";
        } else {
          return "Last Seen "+moment(logedOut).fromNow();
        }
      }

      this.handleSelectedChangedMessage = () => {
        var message = this.getSelectedUidMessageforDelete(this.messageSelectedItems());
        message = message.split('"')[1];
        this.deleteMessageVal(message);
        if (this.firstSelectedItem().data.uid === this.uid()) {
          this.deleteOwner("true");
        } else {
          this.deleteOwner("");
        }
      }

      this.sendValueChanged = (event) => {
        if (event.keyCode === 13 && !event.shiftKey) {
          // this.sendMessage(event.target.value);
          // document.getElementById('sendMessageBtn').click()
        }
      }

      this.openEmojiPop = () => {
        let popup = document.getElementById("emojiPop");
        popup.open("#messade-page");
      }

      this.emojiSelect = (event) => {
        var imoji = event.target.innerText.trim();
        this.sendMessage(this.sendMessage() + imoji);
      }

      this.NavigateHome = () => {
        router.go({ path: 'home' });
      }

      this.messageSelectListener = (files) => {
        this.messageFileNames(Array.prototype.map.call(files, (file) => {
          return file.name;
        }));
      };

      this.messageSelectFiles = (event) => {
        FilePickerUtils.pickFiles(this.selectListener, {
          accept: [],
          capture: "none",
          selectionMode: "single",
        });
      };



      // Header
      // Application Name used in Branding Area
      this.appName = ko.observable("Influx Capital");
      // User Info used in Global Navigation area
      this.userLogin = ko.observable("influxcapitalmail@gmail.com");

      // Footer
      this.footerLinks = [
        { name: "Facebook", id: "facebook", class: "oj-ux-ico-facebook", linkTarget: "https://www.facebook.com/profile.php?id=100087954540350" },
        { name: "Twitter", id: "twitter", class: "oj-ux-ico-twitter", linkTarget: "https://twitter.com/influx_capital" },
        { name: "Instagram", id: "instagram", class: "oj-ux-ico-instagram", linkTarget: "https://www.instagram.com/influxcapital/" },
        { name: "LinkedIn", id: "linkedin", class: "oj-ux-ico-linkedin", linkTarget: "https://www.linkedin.com/in/influx-capital-a6875b256/" },
      ];


      this.init = () => {
        if (this.uid() && this.isLogin() && this.getUID()) {
          var ddUserRole = firebase.database().ref("users/" + this.uid());
          ddUserRole.on("value", (snapshot) => {
            if (snapshot.exists()) {
              var resp = snapshot.val();
              this.userImage(resp.proPicUrl);
              this.userRole(resp.role);
              this.phoneNumber(resp.phone);
            }
          }).catch(e => {
            router.go({ path: 'login' });
          });
        } else {
          router.go({ path: 'login' });
        }
      };
      this.init();
    }
    // release the application bootstrap busy state
    Context.getPageContext().getBusyContext().applicationBootstrapComplete();

    return new ControllerViewModel();
  }
);
