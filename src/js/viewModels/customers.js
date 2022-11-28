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
define(["../accUtils", "firebase", "../icUtils/icutility", "require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider", "ojs/ojlistdataproviderview", "ojs/ojdataprovider", "ojs/ojconverterutils-i18n",
  "ojs/ojknockout", "ojs/ojtable", "ojs/ojinputtext", "ojs/ojbutton", "ojs/ojdialog", "ojs/ojformlayout", "ojs/ojvalidationgroup", "ojs/ojmessages", "ojs/ojselectcombobox"],
  function (accUtils, firebase, icutility,  require, exports, ko, ojbootstrap_1, ArrayDataProvider, ListDataProviderView, ojdataprovider_1, ojconverterutils_i18n_1) {
    function CustomerViewModel(params) {
      const rvm = ko.dataFor(document.getElementById("pageContent"));
      this.baseCustArray = ko.observable();
      this.customerArray = ko.observableArray();
      this.SL_NO = ko.observable();
      this.GUARATOR_NAME = ko.observable();
      this.FIRM_NAME = ko.observable();
      this.CONSTITUTION = ko.observable();
      this.INDUSTRY_TYPE = ko.observable();
      this.MOBILE_NUMBER = ko.observable();
      this.COMMENTS = ko.observable();
      this.CREATED_BY = ko.observable();
      this.CREATED_ON = ko.observable();
      this.isLogin = rvm.isLogin;
      this.userRole = rvm.userRole;
      this.isContrastBackground = rvm.isContrastBackground;

      this.CONSTITUTIONARRAY = ko.observableArray();
      this.dataProviderCONSTITUTION = new ArrayDataProvider(this.CONSTITUTIONARRAY, {
        keyAttributes: "value",
      });

      this.INDUSTRY_TYPEARRAY = ko.observableArray();
      this.dataProviderINDUSTRY_TYPE = new ArrayDataProvider(this.INDUSTRY_TYPEARRAY, {
        keyAttributes: "value",
      });

      this.refreshCustomer = () => {
        rvm.showLoader();
        const dbRef = firebase.database().ref("ICDB");
        dbRef.on("value", (snapshot) => {
          if (snapshot.exists()) {
            var resp = snapshot.val();
            var result = Object.keys(resp).map((key) => [key, resp[key]]);
            this.baseCustArray(result);
            this.customerArray(this.generateCusttArray(1000));
            this.createOptionsArray(Object.values(resp));
            rvm.hideLoader();
          } else {
            rvm.messagesInfo(rvm.getMessagesData("error", "Error", "No data available"));
            rvm.hideLoader();
          }
        });
      };

      this.filter = ko.observable('');
      // this.baseCustArray = this.responseArray();
      this.generateCusttArray = (num) => {
        const custArray = [];
        this.baseCustArray().forEach((cust, index) => {
          custArray.push({
            SL_NO: cust[0],
            GUARATOR_NAME: cust[1].GUARATOR_NAME,
            FIRM_NAME: cust[1].FIRM_NAME,
            CONSTITUTION: cust[1].CONSTITUTION,
            INDUSTRY_TYPE: cust[1].INDUSTRY_TYPE,
            MOBILE_NUMBER: cust[1].MOBILE_NUMBER,
            COMMENTS: cust[1].COMMENTS,
            CREATED_BY: cust[1].CREATED_BY,
            CREATED_ON: cust[1].CREATED_ON
          });
        });
        return custArray;
      };

      // this.custArray = this.generateCusttArray(1000);
      this.dataprovider = ko.computed(function () {
        let filterCriterion = null;
        if (this.filter() && this.filter() != '') {
          filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
            filterDef: { text: this.filter() }
          });
        }
        const arrayDataProvider = new ArrayDataProvider(this.customerArray(), { keyAttributes: 'SL_NO' });
        return new ListDataProviderView(arrayDataProvider, { filterCriterion: filterCriterion });
      }, this);


      this.handleValueChanged = () => {
        this.filter(document.getElementById('filter').rawValue);
      };


      this.highlightingCellRenderer = (context) => {
        let field = null;

        if (context.columnIndex === 0) {
          field = 'GUARATOR_NAME';
        }
        else if (context.columnIndex === 1) {
          field = 'FIRM_NAME';
        }
        else if (context.columnIndex === 2) {
          field = 'CONSTITUTION';
        }
        else if (context.columnIndex === 3) {
          field = 'INDUSTRY_TYPE';
        }
        else if (context.columnIndex === 4) {
          field = 'MOBILE_NUMBER';
        }
        else if (context.columnIndex === 5) {
          field = 'COMMENTS';
        }
        let data = "";
        if (context.columnIndex <= 5) {
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
        { headerText: 'GUARATOR/PROP.NAME', renderer: this.highlightingCellRenderer, id: 'guaratorName' },
        { headerText: 'FIRM NAME', renderer: this.highlightingCellRenderer, id: 'firmName' },
        { headerText: 'CONSTITUTION', renderer: this.highlightingCellRenderer, id: 'constitution' },
        { headerText: 'INDUSTRY TYPE', renderer: this.highlightingCellRenderer, id: 'industryType' },
        { headerText: 'MOBILE NUMBER', renderer: this.highlightingCellRenderer, id: 'mobileNumber', template: 'mobileCellTemplate' },
        { headerText: 'COMMENTS', renderer: this.highlightingCellRenderer, id: 'comments' },
        { headerText: 'ACTIONS', template: 'editCellTemplate', id: 'Actions' }
      ];

      this.addNewCustomer = () => {
        this.clearCustomer();
        document.getElementById("addNewCustomer").open();
      };

      this.editCustomer = (event, context) => {
        this.clearCustomer();
        this.SL_NO(context.item.data.SL_NO);
        this.GUARATOR_NAME(context.item.data.GUARATOR_NAME);
        this.FIRM_NAME(context.item.data.FIRM_NAME);
        this.CONSTITUTION(context.item.data.CONSTITUTION);
        this.INDUSTRY_TYPE(context.item.data.INDUSTRY_TYPE);
        this.MOBILE_NUMBER(context.item.data.MOBILE_NUMBER);
        this.COMMENTS(context.item.data.COMMENTS);
        this.CREATED_BY(context.item.data.CREATED_BY);
        this.CREATED_ON(context.item.data.CREATED_ON);
        document.getElementById("editCustomer").open();
      };

      this.callCustomer = (event, context) => {
        window.open("tel:" + context.item.data.MOBILE_NUMBER);
      };

      this.addNewCustomerCancel = () => {
        document.getElementById("addNewCustomer").close();
      };

      this.editCustomerCancel = () => {
        document.getElementById("editCustomer").close();
      };

      this.addNewCustomerAC = () => {
        var postData = {
          "COMMENTS": this.COMMENTS(),
          "CONSTITUTION": this.CONSTITUTION(),
          "FIRM_NAME": this.FIRM_NAME(),
          "GUARATOR_NAME": this.GUARATOR_NAME(),
          "INDUSTRY_TYPE": this.INDUSTRY_TYPE(),
          "MOBILE_NUMBER": this.MOBILE_NUMBER(),
          "CREATED_BY": rvm.userEmail(),
          "CREATED_ON": ojconverterutils_i18n_1.IntlConverterUtils.dateToLocalIso(new Date()),
          "UPDATED_BY": "",
          "UPDATED_ON": ""
        }
        rvm.showLoader();
        const tracker = document.getElementById("trackerAdd");
        if (tracker.valid === "valid") {
          var myRef = firebase.database().ref('ICDB');
          myRef.push(postData);
          document.getElementById("addNewCustomer").close();
          rvm.messagesInfo(rvm.getMessagesData("confirmation", "Customer", "Added Successfully"));
          rvm.hideLoader();
        }
        else {
          tracker.showMessages();
          tracker.focusOn("@firstInvalidShown");
          rvm.hideLoader();
          return false;
        }
      };

      this.editCustomerAC = (event) => {
        var postData = {
          "COMMENTS": this.COMMENTS(),
          "CONSTITUTION": this.CONSTITUTION(),
          "FIRM_NAME": this.FIRM_NAME(),
          "GUARATOR_NAME": this.GUARATOR_NAME(),
          "INDUSTRY_TYPE": this.INDUSTRY_TYPE(),
          "MOBILE_NUMBER": this.MOBILE_NUMBER(),
          "CREATED_BY": this.CREATED_BY(),
          "CREATED_ON": this.CREATED_ON(),
          "UPDATED_BY": rvm.userEmail(),
          "UPDATED_ON": ojconverterutils_i18n_1.IntlConverterUtils.dateToLocalIso(new Date())
        };
        rvm.showLoader();
        const tracker = document.getElementById("trackerEdit");
        if (tracker.valid === "valid") {
          var database = firebase.database();
          var database_ref = database.ref()
          database_ref.child('ICDB/' + this.SL_NO()).set(postData);
          document.getElementById("editCustomer").close();
          rvm.messagesInfo(rvm.getMessagesData("confirmation", "Customer", "Edited Successfully"));
          rvm.hideLoader();
        }
        else {
          tracker.showMessages();
          tracker.focusOn("@firstInvalidShown");
          rvm.hideLoader();
          return false;
        }
      };

      this.clearCustomer = () => {
        this.SL_NO("");
        this.GUARATOR_NAME("");
        this.FIRM_NAME("");
        this.CONSTITUTION("");
        this.INDUSTRY_TYPE("");
        this.MOBILE_NUMBER("");
        this.COMMENTS("");
        this.CREATED_ON("");
        this.CREATED_ON("");
      };

      this.createOptionsArray = (response) => {
        var constArray = [];
        var indArray = [];
        constArray = [...new Set(response.map((key) => key.CONSTITUTION))]
        constArray = constArray.filter((el) => { return el != "" })
        this.CONSTITUTIONARRAY(constArray.map((str) => ({ value: str, label: str })));
        indArray = [...new Set(response.map((key) => key.INDUSTRY_TYPE))]
        indArray = indArray.filter((el) => { return el != "" })
        this.INDUSTRY_TYPEARRAY(indArray.map((str) => ({ value: str, label: str })));
      };

      this.deleteCustPop = (event, context) => {
        this.clearCustomer();
        this.SL_NO(context.item.data.SL_NO);
        document.getElementById("deleteCustomer").open();
    };

    this.deleteCustomerAC = () => {
        rvm.showLoader();
        var database = firebase.database();
        var database_ref = database.ref();
        database_ref.child('ICDB/' + this.SL_NO()).remove();
        rvm.messagesInfo(rvm.getMessagesData("confirmation", "Customer", "Deleted Successfully"));
        rvm.hideLoader();
        document.getElementById("deleteCustomer").close();
    };

    this.exportCustomer = () => {
      var exportData = [];
      this.customerArray().forEach((cust) => {
        exportData.push({
          "GUARATOR/PROP.NAME": cust.GUARATOR_NAME,
          "FIRM NAME": cust.FIRM_NAME,
          "CONSTITUTION": cust.CONSTITUTION,
          "INDUSTRY TYPE": cust.INDUSTRY_TYPE,
          "MOBILE NUMBER": cust.MOBILE_NUMBER,
          "COMMENTS": cust.COMMENTS
        });
      });
      icutility.downloadBlob(exportData, "influx-capital.csv");
    }


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
        accUtils.announce('Customers page loaded.', 'assertive');
        document.title = "IC | Customers";
        rvm.headerFooterCond("");
        rvm.hideLoader();
        if (!rvm.isLogin() && !rvm.getUID()) {
          params.router.go({ path: 'login' });
        }
        if (this.userRole() !== 'new') {
          this.refreshCustomer();
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
    return CustomerViewModel;
  }
);
