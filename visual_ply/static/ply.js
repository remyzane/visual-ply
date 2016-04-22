/// <reference path='libs/jquery.d.ts' />
/// <reference path='libs/d3.d.ts' />
Array.prototype.in_array = function (e) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == e)
            return true;
    }
    return false;
};
Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) {
        return false;
    }
    this.splice(dx, 1);
};
function do_load() {
    $('#treesvg').height(window.innerHeight - 30);
    new AstTree();
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
            //JSON.stringify(data, null, 4)
        },
        error: function (xhr, status, error) {
            alert('Can not access API [ /ply?node=??? ]');
            return;
        }
    });
    return data;
}
var Ast = (function () {
    function Ast(id, data, px, py, children, parent) {
        if (px === void 0) { px = 0; }
        if (py === void 0) { py = 0; }
        if (children === void 0) { children = []; }
        if (parent === void 0) { parent = null; }
        this.id = id;
        this.data = data;
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
        this.py_center = 30;
        this.px_center = window.innerWidth / 2;
        this.inner_width = window.innerWidth;
        this.ast = null;
        this.curr_node = null;
        this.leftmost = null;
        this.rightmost = null;
        this.bind_root_event();
        this.addChildren('__root__');
    }
    AstTree.prototype.bind_root_event = function () {
        var _tree = this;
        d3.select('#g_rects').selectAll('rect').data([]).enter()
            .append('rect').attr('r', this.vRad)
            .on('click', function (d) {
            return _tree.addChildren(d);
        });
        d3.select('#g_labels').selectAll('text').data([]).enter()
            .append('text')
            .on('click', function (d) {
            return _tree.addChildren(d);
        });
    };
    AstTree.prototype.getVertices = function () {
        var vertices = [];
        function _getVertices(ast) {
            vertices.push(ast);
            for (var _i = 0, _a = ast.children; _i < _a.length; _i++) {
                var children = _a[_i];
                _getVertices(children);
            }
        }
        _getVertices(this.ast);
        return vertices.sort(function (ast_a, ast_b) {
            return ast_a.id - ast_b.id;
        });
    };
    AstTree.prototype.getEdges = function () {
        var edges = [];
        function _getEdges(ast) {
            var id, x2, y2, width = 0;
            var x1 = ast.px;
            var y1 = ast.py;
            for (var _i = 0, _a = ast.children; _i < _a.length; _i++) {
                var children = _a[_i];
                if (!id) {
                    id = children.id;
                    x2 = children.px - children.data.width / 2;
                    y2 = children.py;
                }
                if (children.data.type == 'separator') {
                    edges.push({ 'id': id, 'x1': x1, 'y1': y1, 'x2': x2 + width / 2, 'y2': y2 });
                    id = null;
                    width = 0;
                }
                else {
                    width += children.data.width;
                }
                if (children.data.type == 'production') {
                    _getEdges(children);
                }
            }
            if (id) {
                edges.push({ 'id': id, 'x1': x1, 'y1': y1, 'x2': x2 + width / 2, 'y2': y2 });
            }
        }
        _getEdges(this.ast);
        return edges.sort(function (ast_a, ast_b) {
            return ast_a.id - ast_b.id;
        });
    };
    AstTree.prototype.addChildren = function (parent) {
        var init = parent == '__root__';
        if (this.curr_node == parent) {
            return;
        }
        $('#message').text('loading...');
        if (init) {
            var node = get_node_data('__root__');
            var id = this.serial++;
            this.ast = new Ast(id, node, this.px_center, this.py_center);
            this.addAst(null, this.ast);
            this.leftmost = this.rightmost = this.ast;
            parent = this.ast;
        }
        else {
            if (parent.data.type != 'production') {
                $('#message').text('');
                return;
            }
            var node = get_node_data(parent.data.ext.name);
        }
        var parent_id_list = [];
        var parent_cursor = this.curr_node = parent;
        if (!init) {
            parent_cursor = parent.parent;
        }
        while (parent_cursor) {
            parent_id_list.push(parent_cursor.id);
            parent_cursor = parent_cursor.parent;
        }
        $('line').remove();
        $('rect').remove();
        $('text').remove();
        function _clear(ast) {
            for (var i = ast.children.length - 1; i > -1; i--) {
                _clear(ast.children[i]);
                if (!parent_id_list.in_array(ast.children[i].parent.id)) {
                    //$('#line_' + ast.children[i].id).remove();
                    //$('#rect_' + ast.children[i].id).remove();
                    //$('#label_' + ast.children[i].id).remove();
                    ast.children.remove(i);
                }
            }
        }
        _clear(this.ast);
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var children_data = _a[_i];
            var id = this.serial++;
            var children = new Ast(id, children_data);
            this.addAst(parent, children);
        }
        this.reposition(this.ast);
        this.redraw();
        $('#message').text('');
    };
    AstTree.prototype.addAst = function (parent, c_ast) {
        if (parent) {
            c_ast.parent = parent;
        }
        function _add(ast) {
            if (c_ast.parent && ast.id == c_ast.parent.id) {
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
    AstTree.prototype.get_excess = function (parent_cursor) {
        var excess = { 'left': -10000, 'right': -10000 };
        while (parent_cursor) {
            var left_node = parent_cursor.children[0];
            var right_node = parent_cursor.children[parent_cursor.children.length - 1];
            var left = left_node.data.width / 2 - left_node.px;
            var right = right_node.px + right_node.data.width / 2 - this.inner_width;
            if (left > excess.left && excess.right < 0) {
                excess.left = left;
            }
            if (right > excess.right && excess.left < 0) {
                excess.right = right;
            }
            parent_cursor = parent_cursor.parent;
        }
        return excess;
    };
    AstTree.prototype.reposition = function (root_ast) {
        var _tree = this;
        var min_width = 0;
        function _repo(ast) {
            var children_width = 0;
            for (var _i = 0, _a = ast.children; _i < _a.length; _i++) {
                var children = _a[_i];
                children_width += children.data.width;
            }
            if (min_width < children_width) {
                min_width = children_width;
            }
            var left = ast.px - children_width / 2;
            for (var _b = 0, _c = ast.children; _b < _c.length; _b++) {
                var children = _c[_b];
                children.px = left + children.data.width / 2;
                children.py = ast.py + _tree.tier_height;
                left += children.data.width;
                _repo(children);
            }
        }
        _repo(root_ast);
        if (window.innerWidth < min_width + 20) {
            $('#treesvg').width(min_width + 20);
            this.px_center = (min_width + 20) / 2;
            this.inner_width = min_width + 20;
        }
        else {
            $('#treesvg').width(window.innerWidth);
            this.px_center = window.innerWidth / 2;
            this.inner_width = window.innerWidth;
        }
        var need_move = false;
        var excess = this.get_excess(this.curr_node);
        if (excess.left > 0 || excess.right > 0) {
            need_move = true;
            if (excess.left > 0) {
                if (excess.left < (-excess.right) + 10) {
                    root_ast.px += excess.left + 10;
                }
                else {
                    root_ast.px += (-excess.right) - 5;
                }
            }
            else {
                if (excess.right < (-excess.left) + 10) {
                    root_ast.px -= excess.right + 10;
                }
                else {
                    root_ast.px -= (-excess.left) - 5;
                }
            }
        }
        var excess_bottom = this.curr_node.children[0].py + this.vRad + 40 - window.innerHeight;
        if (excess_bottom > 0) {
            root_ast.py -= excess_bottom;
            need_move = true;
        }
        else {
            if (root_ast.py != this.py_center) {
                if ((this.py_center - root_ast.py) < (-excess_bottom - 10)) {
                    root_ast.py = this.py_center;
                }
                else {
                    root_ast.py += (-excess_bottom) - 10;
                }
                need_move = true;
            }
        }
        if (need_move) {
            _repo(root_ast);
        }
    };
    AstTree.prototype.redraw = function () {
        var _tree = this;
        var edges = d3.select('#g_lines').selectAll('line').data(this.getEdges());
        edges.enter().append('line')
            .attr('id', function (d) { return 'line_' + d.id; })
            .attr('x1', function (d) { return d.x1; })
            .attr('y1', function (d) { return d.y1 + _tree.vRad; })
            .attr('x2', function (d) { return d.x2; })
            .attr('y2', function (d) { return d.y2 - _tree.vRad; });
        var rects = d3.select('#g_rects').selectAll('rect').data(this.getVertices());
        rects.enter().append('rect')
            .attr('id', function (d) { return 'rect_' + d.id; })
            .attr('ext', function (d) { return d.data.ext; })
            .attr('height', this.vRad * 2)
            .attr('width', function (d) { return d.data.width; })
            .attr('x', function (d) { return d.px - d.data.width / 2; })
            .attr('y', function (d) { return d.py - _tree.vRad; })
            .attr('class', function (d) { return d.data.type; })
            .on('click', function (d) { return _tree.addChildren(d); });
        var labels = d3.select('#g_labels').selectAll('text').data(this.getVertices());
        labels.enter().append('text')
            .attr('id', function (d) { return 'label_' + d.id; })
            .attr('ext', function (d) { return d.data.ext; })
            .attr('x', function (d) { return d.px; })
            .attr('y', function (d) { return d.py + 5; })
            .attr('class', function (d) { return d.data.type; })
            .text(function (d) { return d.data.label; })
            .on("mousemove", _tree.showStatus)
            .on("mouseout", function () { $('#status').text(''); })
            .on('click', function (d) { return _tree.addChildren(d); });
    };
    AstTree.prototype.showStatus = function (ast) {
        console.log(ast.data);
        var ext = ast.data.ext;
        var status = 'function: ' + ast.data.fun;
        switch (ast.data.type) {
            case 'token_char':
                status += '　　　　　　token: ' + ext.text;
                break;
            case 'token_expression':
                status += '　　　　　　token expression: ' + ext.text;
                break;
            case 'production_self':
                status += '　　　　　　production: ' + ext.text;
                break;
            case 'separator':
                status = '';
                break;
        }
        $('#status').text(status);
    };
    return AstTree;
})();
