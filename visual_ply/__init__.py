
random_number = 0
visual_ply = None


def code(name):
    global random_number
    random_number += 1
    return '%s_%d' % (name, random_number)


def width(name):
    # import string
    # _width = 0
    # for _char in name:
    #     _width += 5.3 if (_char in string.lowercase) else 10.5
    # return int(_width)
    return len(name) * 9 + 2


def get_visual_ply(lexer, parser, root_node):
    global visual_ply
    if not visual_ply:
        visual_ply = VisualPly(lexer, parser, root_node)
    return visual_ply


class VisualPly(object):
    def __init__(self, lexer, parser, root_node):
        self.lexer = lexer
        self.parser = parser
        self.root_node = root_node
        self.tokens = dict()
        self.productions = dict()
        for token_str in lexer.lexstatere['INITIAL'][0][0].pattern[3:-1].split(')|(?P'):
            name, value = token_str[3:].split('>', 1)
            self.tokens[name] = value
        for production in parser.productions:
            if production.name not in self.productions:
                self.productions[production.name] = []
            self.productions[production.name].append({
                'func': production.func,
                'str': production.str.split(' -> ')[1]
            })

    def get_node(self, node_name):
        node_name = self.root_node if node_name == '__root__' else node_name
        children_list = []
        for production in self.productions.get(node_name):
            for case_str in production['str'].split():
                label = case_str
                _type = 'other_string'
                ext = dict()
                if case_str in self.tokens:
                    if len(self.tokens[case_str]) == 1:
                        label = self.tokens[case_str]
                        ext['text'] = case_str
                        _type = 'token_char'
                    else:
                        ext['text'] = self.tokens[case_str]
                        _type = 'token_expression'
                elif case_str == node_name:
                    label = '~ '
                    ext['text'] = case_str
                    _type = 'production_self'
                elif case_str in self.productions:
                    _type = 'production'
                    ext['name'] = case_str
                children_list.append({'type': _type, 'ext': ext, 'label': label, 'width': width(label),
                                  'fun': production['func'], 'children': []})

            children_list.append({'type': 'separator', 'label': '|', 'name': '|', 'width': width('  '), 'children': []})

        return {'name': node_name, 'width': width(node_name), 'label': node_name, 'type': 'production',
                'children': children_list[:-1]}
