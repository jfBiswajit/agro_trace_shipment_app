var app = {
  initialize: function () {
    if (typeof window.cordova !== 'undefined') {
      document.addEventListener(
        'deviceready',
        function () {
          onDeviceReady(true);
        },
        false
      );
    } else {
      onDeviceReady(false);
    }
  },
};

function onDeviceReady() {
  // const server = 'http://hbtobacco.inventory.aqualinkbd.com/api/';
  const server = 'http://192.168.0.119:80/api/';
  const driverRegBtn = document.querySelector('#driver_registration_btn');
  const vehicleRegBtn = document.querySelector('#vehicle_registration_btn');
  const getLoadBaleTemplateBtn = document.querySelector(
    '#get_load_bale_template_btn'
  );
  const loadDoneBtn = document.querySelector('#load_done_btn');
  const unLoadDoneBtn = document.querySelector('#unload_done_btn');
  const scanToLoadBtn = document.querySelector('#scan_to_load_btn');
  const scanToUnloadBtn = document.querySelector('#scan_to_unload_bale_btn');
  const scanShipmentVoucharBtn = document.querySelector(
    '#scan_shipment_vouchar'
  );
  const scanToRemoveBtn = document.querySelector('#scan_to_delete_btn');
  const loginForm = $('#login_form');

  const activeCurrentTab = function (tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName('tabcontent');

    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }

    tablinks = document.getElementsByClassName('tablinks');

    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    document.getElementById(tabName).style.display = 'block';
  };

  const setDefaultDateToToday = function () {
    Date.prototype.toDateInputValue = function () {
      var local = new Date(this);
      local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
      return local.toJSON().slice(0, 10);
    };

    $('.set_default_date').val(new Date().toDateInputValue());
  };

  const deleteRow = function (tblID, VALUE) {
    $('#' + tblID)
      .find(`td:contains(${VALUE})`)
      .closest('tr')
      .remove();
  };

  const showBody = function () {
    document.querySelector('body').setAttribute('style', 'display: block');
  };

  const hideBody = function () {
    document.querySelector('body').setAttribute('style', 'display: none');
  };

  const initDatatable = function () {
    var table = $('.basic_datatable').DataTable();
    if (!table instanceof $.fn.dataTable.Api) {
      $('.basic_datatable').DataTable({
        aaSorting: [],
        lengthChange: false,
        responsive: true,
        language: {
          searchPlaceholder: 'Search...',
          sSearch: '',
          lengthMenu: '_MENU_ ',
        },
      });
    }
  };

  const initSelectize = function () {
    $('.selectize_me').SumoSelect({
      search: true,
      searchText: 'Enter here.',
      forceCustomRendering: true,
    });
  };

  const onBackKeyDown = function (e) {
    e.preventDefault();
    QRScanner.cancelScan();
    activeCurrentTab('tab_home');
  };

  const loginAction = function (e) {
    $.ajax({
      url: server + 'get_user_access',
      type: 'GET',
      data: $('#login_form').serialize(),

      error() {
        swal('Sorry!', "Can't connect to server.", 'error');
      },

      success(response) {
        if (response.success) {
          let accessModules = response.data;
          window.localStorage.setItem('userId', $('#user_id').val());
          accessModules.forEach(function (module) {
            $(`#${module}`).show();
          });
          activeCurrentTab('tab_home');
        } else {
          swal('Unauthorized!', "Your credentials don't match.", 'error');
        }
      },
    });
  };

  const getDriverRegTemplate = function (e) {
    $.ajax({
      url: server + 'get_driver_reg_template',
      type: 'GET',

      error() {
        swal('Sorry!', "Can't connect to server.", 'error');
      },

      success(response) {
        $('#tab_driver_registation').html(response);
        activeCurrentTab('tab_driver_registation');
      },
    });
  };

  const getVehicleRegTemplate = function (e) {
    $.ajax({
      url: server + 'get_vehicle_reg_template',
      type: 'GET',

      error() {
        swal('Sorry!', "Can't connect to server.", 'error');
      },

      success(response) {
        $('#tab_vehicle_registation').html(response);
        activeCurrentTab('tab_vehicle_registation');
      },
    });
  };

  const getLoadBaleTemplate = function (e) {
    $.ajax({
      url: server + 'get_load_bale_template',
      type: 'GET',

      error() {
        swal('Sorry!', "Can't connect to server.", 'error');
      },

      success(response) {
        $('#tab_generate_operation').html(response);
        activeCurrentTab('tab_generate_operation');
      },
    });
  };

  const registerDriver = function (e) {
    e.preventDefault();

    $.ajax({
      url: server + 'register_driver',
      type: 'POST',
      data: $('#form_driver_reg').serialize(),

      error() {
        swal('Sorry!', "Can't connect to server.", 'error');
      },

      success(response) {
        if (response.err) {
          swal('Warning!', 'Driver already exist.', 'warning');
        } else {
          swal('Success!', 'Driver successfully registered.', 'success');
          activeCurrentTab('tab_home');
        }
      },
    });
  };

  const registerVehicle = function (e) {
    e.preventDefault();

    $.ajax({
      headers: {
        Accept: 'application/json',
      },
      url: server + 'register_vehicle',
      type: 'POST',
      data: $('#form_vehicle_reg').serialize(),

      error(response) {
        if (response.responseJSON.message) {
          swal('Warning!', response.responseJSON.message, 'warning');
        } else {
          swal('Sorry!', "Can't connect to server.", 'error');
        }
      },

      success(response) {
        swal('Success!', 'Vehicle successfully registered.', 'success');
        activeCurrentTab('tab_home');
      },
    });
  };

  const goToLoadBalePage = function (e) {
    e.preventDefault();
    activeCurrentTab('tab_scan_and_load');
    $('#show_tracking_id').html(`Load Bale`);
    $('#loaded_bale_list').html('');
  };

  const addTrackingIdAndExistingData = function (response) {
    $('#tracking_id').val(response.trackingId);
    $('#show_tracking_id').html(`Load Bale: ${response.trackingId}`);
    $('#loaded_bale_list').html(response.existingData);
  };

  const scanToLoadBale = function () {
    window.QRScanner.prepare(() => {
      hideBody();
      window.QRScanner.show(() => {
        window.QRScanner.scan((err, text) => {
          showBody();
          if (text) {
            $.ajax({
              url: server + 'load_bale',
              type: 'POST',
              dataType: 'json',
              data: {
                tracking_id: $('#tracking_id').val(),
                bale_id: text,
                driver_id: $('#driver_id').val(),
                vehicle_id: $('#vehicle_id').val(),
                from_warehouse: $('#from_warehouse').val(),
                to_warehouse: $('#to_warehouse').val(),
              },

              error() {
                swal('Sorry!', "Can't connect to server.", 'error');
              },

              success(response) {
                if (response.isSuccess) {
                  if (response.isBaleExists) {
                    swal({
                      title: 'Exists!',
                      text: 'Do you want to go existing operation?',
                      icon: 'warning',
                      buttons: true,
                      dangerMode: true,
                    }).then((wantToGoExistingOperation) => {
                      if (wantToGoExistingOperation) {
                        addTrackingIdAndExistingData(response);
                      }
                    });
                  } else {
                    addTrackingIdAndExistingData(response);
                  }
                } else {
                  swal('Warning!', response.msg, 'warning');
                }
              },
            });
          }
        });
      });
    });
  };

  const scanToUnload = function () {
    window.QRScanner.prepare(() => {
      hideBody();
      window.QRScanner.show(() => {
        window.QRScanner.scan((err, text) => {
          showBody();
          if (text) {
            $.ajax({
              url: server + 'unload_bale',
              type: 'POST',
              dataType: 'json',
              data: {
                tracking_id: $('#vouchar_tracking_id').val(),
                bale_id: text,
              },

              error() {
                swal('Sorry!', "Can't connect to server.", 'error');
              },

              success(response) {
                if (response.isSuccess) {
                  swal('Success', response.msg, 'success');
                  $('#unloaded_bale_list').html(response.existingData);
                } else {
                  if (response.isBaleMissing) {
                    swal({
                      title: 'Missing Bale!',
                      text: response.msg,
                      icon: 'warning',
                      buttons: true,
                      dangerMode: true,
                    }).then((wantToAddMissingBale) => {
                      if (wantToAddMissingBale) {
                        $.ajax({
                          type: 'POST',
                          url: server + 'load_bale',
                          dataType: 'json',
                          data: {
                            bale_id: text,
                            tracking_id: $('#vouchar_tracking_id').val(),
                            is_missing_bale: true,
                          },

                          error() {
                            swal('Sorry!', "Can't connect to server.", 'error');
                          },

                          success(response) {
                            swal('Success', `${response.msg}`, 'success');
                            $('#unloaded_bale_list').html(
                              response.existingData
                            );
                          },
                        });
                      }
                    });
                  } else {
                    swal('Warning!', response.msg, 'warning');
                  }
                }
              },
            });
          }
        });
      });
    });
  };

  const scanShipmentVouchar = function () {
    window.QRScanner.prepare(() => {
      hideBody();
      window.QRScanner.show(() => {
        window.QRScanner.scan((err, text) => {
          showBody();
          if (text) {
            $.ajax({
              url: server + 'unload_bale',
              type: 'POST',
              dataType: 'json',
              data: {
                tracking_id: text,
              },

              error() {
                swal('Sorry!', "Can't connect to server.", 'error');
              },

              success(response) {
                if (response.isSuccess) {
                  $('#show_unload_tracking_id').html(
                    `Unload Bale: ${response.trackingId}`
                  );
                  $('#unloaded_bale_list').html(response.existingData);
                  $('#vouchar_tracking_id').val(response.trackingId);
                  activeCurrentTab('tab_scan_and_unload');
                } else {
                  swal('Warning!', response.msg, 'warning');
                }
              },
            });
          }
        });
      });
    });
  };

  const scanToRemove = function () {
    window.QRScanner.prepare(() => {
      hideBody();
      window.QRScanner.show(() => {
        window.QRScanner.scan((err, text) => {
          showBody();
          if (text) {
            if (confirm('Are you sure want to remove?')) {
              $.ajax({
                url: server + 'remove_loaded_bale',
                type: 'POST',
                dataType: 'json',
                data: {
                  bale_id: text,
                },

                error() {
                  swal('Sorry!', "Can't connect to server.", 'error');
                },

                success(response) {
                  if (response.isSuccess) {
                    swal('Success', `${response.msg}`, 'success');
                    deleteRow('loaded_bale_list', text);
                  } else {
                    swal('Warning', `${response.msg}`, 'warning');
                  }
                },
              });
            }
          }
        });
      });
    });
  };

  const initEvents = function () {
    loginForm.submit(function (e) {
      e.preventDefault();
      loginAction(e);
    });

    driverRegBtn.addEventListener('click', function (e) {
      getDriverRegTemplate();
    });

    vehicleRegBtn.addEventListener('click', function (e) {
      getVehicleRegTemplate();
    });

    getLoadBaleTemplateBtn.addEventListener('click', function (e) {
      getLoadBaleTemplate();
    });

    loadDoneBtn.addEventListener('click', function (e) {
      activeCurrentTab('tab_home');
    });

    unLoadDoneBtn.addEventListener('click', function (e) {
      activeCurrentTab('tab_home');
    });

    scanToRemoveBtn.addEventListener('click', function (e) {
      scanToRemove();
    });

    scanToLoadBtn.addEventListener('click', function (e) {
      scanToLoadBale();
    });

    scanToUnloadBtn.addEventListener('click', function (e) {
      scanToUnload();
    });

    scanShipmentVoucharBtn.addEventListener('click', function (e) {
      scanShipmentVouchar();
    });

    $(document.body).on('submit', '#form_driver_reg', function (e) {
      registerDriver(e);
    });

    $(document.body).on('submit', '#form_go_to_new_operation', function (e) {
      goToLoadBalePage(e);
    });

    $(document.body).on('submit', '#form_vehicle_reg', function (e) {
      registerVehicle(e);
    });

    // Common events
    $(document.body).on('click', '#home_btn', function (e) {
      activeCurrentTab('tab_home');
    });

    document.addEventListener('backbutton', onBackKeyDown, false);

    activeCurrentTab('tab_home');
    initSelectize();
  };

  initEvents();
}

app.initialize();
