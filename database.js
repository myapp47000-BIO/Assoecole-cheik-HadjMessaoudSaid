// Cloud Database - localStorage as primary storage
var CLOUD_DB = {
    read: function() {
        try {
            var data = localStorage.getItem('ecole_parents_db');
            if (data) return JSON.parse(data);
            var initial = { parents: [], meta: { lastUpdated: new Date().toISOString(), totalParents: 0, totalStudents: 0 } };
            localStorage.setItem('ecole_parents_db', JSON.stringify(initial));
            return initial;
        } catch (e) { return { parents: [], meta: {} }; }
    },
    write: function(data) {
        try {
            data.meta.lastUpdated = new Date().toISOString();
            data.meta.totalParents = data.parents.length;
            data.meta.totalStudents = data.parents.reduce(function(s, p) { return s + (p.students ? p.students.length : 0); }, 0);
            localStorage.setItem('ecole_parents_db', JSON.stringify(data));
            return true;
        } catch (e) { return false; }
    },
    addParent: function(parentData) {
        var data = this.read();
        if (!data.parents) data.parents = [];
        var exists = data.parents.find(function(p) { return p.id === parentData.id; });
        if (!exists) data.parents.push(parentData);
        return this.write(data);
    },
    updateParent: function(id, updates) {
        var data = this.read();
        var index = data.parents.findIndex(function(p) { return p.id === id; });
        if (index !== -1) { data.parents[index] = Object.assign({}, data.parents[index], updates); return this.write(data); }
        return false;
    },
    deleteParent: function(id) {
        var data = this.read();
        data.parents = data.parents.filter(function(p) { return p.id !== id; });
        return this.write(data);
    },
    getAllParents: function() {
        var data = this.read();
        return data.parents || [];
    },
    getStats: function() {
        var parents = this.getAllParents();
        var stats = { totalParents: parents.length, totalStudents: 0, studentsByLevel: {}, recentParents: [] };
        parents.forEach(function(p) {
            if (p.students) {
                p.students.forEach(function(s) {
                    var level = s.levelName || s.level;
                    stats.studentsByLevel[level] = (stats.studentsByLevel[level] || 0) + 1;
                    stats.totalStudents++;
                });
            }
        });
        stats.recentParents = parents.sort(function(a, b) { return new Date(b.loginDate || 0) - new Date(a.loginDate || 0); }).slice(0, 10);
        return stats;
    },
    exportCSV: function() {
        var parents = this.getAllParents();
        if (parents.length === 0) return null;
        var csv = 'الاسم,البريد الإلكتروني,رقم الهاتف,المستوى,تاريخ التسجيل\n';
        parents.forEach(function(p) {
            csv += '"' + (p.name || '') + '","' + (p.email || '') + '","' + (p.phone || '') + '","' + (p.levelName || p.level || '') + '","' + (p.loginDate || '') + '"\n';
        });
        return csv;
    }
};
