/// <reference path="libs/jquery.d.ts" />
/// <reference path="libs/d3.d.ts" />
function do_load() {
    //console.log(JSON.stringify(root_node, null, 4));
    var ply = new AstTree();
}
function get_node_data(node_name) {
    var data = null;
    $.ajax({
        url: '/ply?node=' + node_name,
        type: 'GET',
        async: false,
        dataType: 'json',
        timeout: 3000,
        success: function (_data, textStatus, jqXHR) {
            data = _data;
        },
        error: function (xhr, status, error) {
            alert('Can not access API [ /ply?node=xxx ]');
            return;
        }
    });
    return data;
}
var Ast = (function () {
    function Ast(id, name, width, px, py, children, parent) {
        if (px === void 0) { px = 0; }
        if (py === void 0) { py = 0; }
        if (children === void 0) { children = []; }
        if (parent === void 0) { parent = { id: null, px: null, py: null }; }
        this.id = id;
        this.name = name;
        this.width = width;
        this.px = px;
        this.py = py;
        this.children = children;
        this.parent = parent;
    }
    return Ast;
})();
var AstTree = (function () {
    function AstTree() {
        this.serial = 1;
        this.vRad = 10;
        this.tier_height = 70;
        this.ast = null;
        this.curr_node = null;
        this.bind_root_event();
        this.addChildren(null);
    }
    AstTree.prototype.bind_root_event = function () {
        var _tree = this;
        d3.select("#g_rects").selectAll('rect').data([]).enter()
            .append('rect').attr('r', this.vRad)
            .on('click', function (d) {
            return _tree.addChildren(d);
        });
        d3.select("#g_labels").selectAll('text').data([]).enter()
            .append('text')
            .on('click', function (d) {
            return _tree.addChildren(d);
        });
    };
    AstTree.prototype.getVertices = function () {
        var v = [];
        function _getVertices(t) {
            v.push(t);
            for (var _i = 0, _a = t.children; _i < _a.length; _i++) {
                var d = _a[_i];
                _getVertices(d);
            }
        }
        _getVertices(this.ast);
        return v.sort(function (a, b) {
            return a.id - b.id;
        });
    };
    AstTree.prototype.getEdges = function () {
        var e = [];
        function _getEdges(_) {
            for (var _i = 0, _a = _.children; _i < _a.length; _i++) {
                var children = _a[_i];
                e.push(children);
                _getEdges(children);
            }
        }
        _getEdges(this.ast);
        return e.sort(function (a, b) { return a.id - b.id; });
    };
    AstTree.prototype.addChildren = function (parent) {
        if (parent) {
            var node = get_node_data(parent.name);
        }
        else {
            var node = get_node_data('__root__');
            var id = this.serial++;
            this.ast = new Ast(id, node.name, node.width, window.innerWidth / 2 - 20, 30);
            this.addAst(null, this.ast);
            parent = this.ast;
        }
        this.curr_node = parent;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var children_data = _a[_i];
            var id = this.serial++;
            var children = new Ast(id, children_data.name, children_data.width);
            this.addAst(parent, children);
        }
        function _clear(ast) {
            var new_children = [];
            for (var _i = 0, _a = ast.children; _i < _a.length; _i++) {
                var children = _a[_i];
                if (children.parent.px == ast.px && children.parent.py == ast.py) {
                    new_children.push(children);
                    _clear(children);
                }
            }
            ast.children = new_children;
        }
        _clear(this.ast);
        this.reposition(this.ast);
        this.redraw();
    };
    AstTree.prototype.addAst = function (parent, c_ast) {
        if (parent) {
            c_ast.parent = { id: parent.id, px: parent.px, py: parent.py };
        }
        function _add(ast) {
            if (ast.id == c_ast.parent.id) {
                ast.children.push(c_ast);
                return true;
            }
            for (var _i = 0, _a = ast.children; _i < _a.length; _i++) {
                var children = _a[_i];
                if (_add(children)) {
                    return true;
                }
            }
            return false;
        }
        _add(this.ast);
    };
    AstTree.prototype.redraw = function () {
        var _tree = this;
        var edges = d3.select("#g_lines").selectAll('line').data(this.getEdges());
        edges.enter().append('line')
            .attr('x1', function (d) { return d.parent.px; })
            .attr('y1', function (d) { return d.parent.py + _tree.vRad - 1; })
            .attr('x2', function (d) { return d.px; })
            .attr('y2', function (d) { return d.py - _tree.vRad; });
        var rects = d3.select("#g_rects").selectAll('rect').data(this.getVertices());
        rects.enter().append('rect')
            .attr('height', this.vRad * 2)
            .attr('width', function (d) { return d.width; })
            .attr('x', function (d) { return d.px - d.width / 2; })
            .attr('y', function (d) { return d.py - _tree.vRad; })
            .on('click', function (d) { return _tree.addChildren(d); });
        var labels = d3.select("#g_labels").selectAll('text').data(this.getVertices());
        labels.enter().append('text')
            .text(function (d) { return d.name; })
            .attr('x', function (d) { return d.px; })
            .attr('y', function (d) { return d.py + 5; })
            .on('click', function (d) { return _tree.addChildren(d); });
    };
    AstTree.prototype.reposition = function (ast) {
        var children_width = 0;
        for (var _i = 0, _a = ast.children; _i < _a.length; _i++) {
            var children = _a[_i];
            children_width += children.width;
        }
        var left = ast.px - children_width / 2;
        for (var _b = 0, _c = ast.children; _b < _c.length; _b++) {
            var children = _c[_b];
            children.px = left + children.width / 2;
            children.py = ast.py + this.tier_height;
            left += children.width;
            this.reposition(children);
        }
        console.log(ast);
    };
    return AstTree;
})();
