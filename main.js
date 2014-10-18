Meteor.call('spreadsheet/fetch', Meteor.settings.public.spreadsheetKey, 0, '', 1);

var data = GASpreadsheet.findOne({
    spreadsheet: 'meteor-spreadsheet'
});

var navigation = {},
    header = [];

var getNavigation = function() {
    if (!data || header.length > 0) {
        return navigation;
    }

    for (var i in data.header) {
        if (!data.header.hasOwnProperty(i)) {
            return;
        }
        var name = data.header[i].value.toLowerCase();
        header.push(name);
    };

    // iterate rows
    var rowNum = 0;
    for (var j in data.cells) {
        if (!data.cells.hasOwnProperty(j)) {
            return;
        }

        var row = data.cells[j],
            handle = row[Object.keys(row)[0]].value;

        var navItems = {
                _index: rowNum
            },
            columnNum = 0;
        for (var k in row) {
            if (!row.hasOwnProperty(k)) {
                return;
            }
            var cell = row[k]

            // add cell
            var name = header[columnNum],
                value = cell.value;
            navItems[name] = value;
            columnNum++;
        }

        // add rows
        navigation[handle] = navItems;
        rowNum++;
    };

    return navigation;
};

var getNavigationItem = function(handle) {
    var navigation = getNavigation();
    if (!navigation[handle]) {
        throw new Error('Navigation item for handle \'' + handle + '\' does not exist.');
    }
    return navigation[handle];
};

// Routing

// Router.configure({
//     layoutTemplate: 'layout'
// });

var routePage = function(route) {
    var handle = route.params._handle || 'home';

    this.layout('layout', {
        data: {
            navigation: function() {
                var nav = getNavigation(),
                    navArray = [];
                Object.getOwnPropertyNames(nav).forEach(function(n) {
                    navArray.push(nav[n]);
                });
                return navArray;
            }
        }
    });

    this.render('page', {
        to: 'content',
        data: function() {
            return getNavigationItem(handle);
        }
    });
};

Router.map(function() {
    this.route('home', {
        path: '/',
        action: routePage
    });
    this.route('/:_handle', routePage);
});

/*
Router.route('/:_handle', );
*/