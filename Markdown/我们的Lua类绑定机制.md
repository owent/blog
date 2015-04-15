���ǵ�Lua��󶨻���
======

[TOC]

ǰ��
------

���һ���˸��̨����ܵײ�+�߼�����ãã�࣬���ñȽ����࣬һֱû�������д�㶫����

���е�ʱ�䣬������[LLVM+Clang+libc++��libc++abi�ı���ű�](https://www.owent.net/?p=1149)�����ò�˵clang�ı���ű�������gcc���һ��㡣Ϊ����centos�¾����ܱ��������Ĺ��ܺ�llvm������Ŀ��Ҫ���ָĸ����Բ������Ծ�ͨ���������������������Ķ����ƴ�ÿ��š����������Ǹ�һ���䡣

��Ϊ��Ŀ��Ҫ�����˱�[��Redis�������ʵ�֡�](http://www.duokan.com/book/53962)�ĵ��Ӱ棬˳����Ȿ������߹�����һ������Redis�ĵ��ķ��롣�Ȿ��ͨƪ�����룬�е㿴blog�ĸо���д�û��Ǻܼ��׶��ġ�������˭������Ϊë�һ���30�������겻������¾ͱ��10���ˣ��ӵ�ô���ǡ�T_T��

���⻹����ɢɢ�ؿ���Щ[������Ա����������-���ӡ�װ����⡷](http://book.douban.com/subject/3652388/) �Ȿ��[�Ʒ�](http://blog.codingnow.com)֮ǰ�Ƽ������������ҿ�����Щ�����д�������ȷʵ��һ��ֵ���Ƽ������Ҳ��ɶ�õļ�����

���ǻص�����

ΪʲôҪ��дLua��󶨣�
------

���������õö���tolua++������tolua++ò�ƺܾ�û�и����ˣ����Ҳ�֧��lua����5.1�İ汾��������ʹ�õĹ����з�����һЩ�ӣ��Ƚ�����+���ġ��ܲ�����������ʱʱ�̼̿�ס��Щ�Ӱɣ��ټ��Ϸ�������lua�ű���Ƚ������������Ծ���һ���򵥸�Ч��Lua�󶨻��ơ�

������ˣ������ĵ�һѡ����ȥ���˸������**LuaBridge**����Ŀ������ʹ�õ�ʱ���֣�һ�ǲ����Ǻܷ��㣬�������Ҳ����Ĳ��ã����������Լ���һ�����ˡ�

�����󶨵Ľӿ���ʽ
------

�ȿ����Ǻ����󶨵����ճɹ� ��Ҫ��һ��������Ա��ֻҪ��cpp�ļ��м�����������Ĵ��뼴�ɣ�
```cpp
// ���FightBullet���ֿ������⣬ֻҪ��֤ȫ��Ψһ���ҷ���c++��ʶ�����򼴿ɣ�����gtest
LUA_BIND_OBJECT(FightBullet) {
    // ������Ĵ������Lua�󶨹�������ʼ��ʱ�Զ�ִ��
    lua_State* L = script::lua::LuaEngine::Instance()->getLuaState();

    // ����һ���࣬�����ռ���game.logic��������FightBullet
    script::lua::LuaBindingClass<FightBullet> clazz("FightBullet", "game.logic", L);

    // �����Ա������static�����������Զ��ƶϺ���������ֵ�Ͳ�������
    {
        clazz.addMethod("getId", &FightBullet::getId);
        clazz.addMethod("getTypeId", &FightBullet::getTypeId);
        clazz.addMethod("getFightRoomId", &FightBullet::getFightRoomId);
        clazz.addMethod("addActionTimer", &FightBullet::addActionTimer);
        clazz.addMethod("setNextActionFrame", &FightBullet::setNextActionFrame);
        clazz.addMethod("getNextActionFrame", &FightBullet::getNextActionFrame);
        clazz.addMethod("skill", &FightBullet::skill);
    }
}
```

�ǲ��Ǻܼ򵥣�


��������ʵ��ԭ��
------

### Lua���������(ģ��̳к͸���)
Luaԭ������֧������������,������������ʹ����һ���򵥵ķ�������������������һЩģ�⡣

����Lua�����ԣ���һ��table���ԣ�rawger�Ҳ����Ķ�����ȥ����metatable��index���������ֲ��ҷ�

```
function gettable_event (table, key)
  local h
  if type(table) == "table" then
    local v = rawget(table, key)
    if v ~= nil then return v end
    h = metatable(table).__index
    if h == nil then return nil end
  else
    h = metatable(table).__index
    if h == nil then
      error(������)
    end
  end
  if type(h) == "function" then
    return (h(table, key))     -- call the handler
  else return h[key]           -- or repeat operation on it
  end
end
```

���ǣ����ǿ���������������ģ��̳к͸��ǡ���table��metatable��Ϊ����__index��Ϊ�����table������

```lua
local father = {}
local child = {}
setmetatable(child, child)
child.__index = father
```

Ϊʲô���½�һ��table��Ϊmetatable������__index��Ϊ�����أ�

```lua
local father = {}
local child = {}
setmetatable(child, {__index = father})
```

�����������ʾ�����Ǹ��ɾ��𣿶��һ��ܸ���ػ����ڴ棿ԭ����������һ�ǲ���մ���һ��table����Ϊÿһ�δ���table����ζ��lua�������malloc��������һ�������ǵ��������һЩͨ�õķ���������˵����__tostring�������ڰѶ���ת�����ַ�������ʵ�ֶ�tostring������ת������ʱ�����ǻ��ӡ����ǰ��ʵ����ʵ�����͡�Ȼ�����__tostring������д�ڻ�����ģ����ͨ�������һ�ַ�ʽ������ֻҪ��ĳ�ֹ��������������table��ĳ���ֶ������ֱ�Ӷ�ȡ����ֶμ��ɡ�����õڶ��ַ���������ִ��__tostring��ʱ�򣬸��ຯ�����self���󲢲�������������Ծͻ�ȡ����������Ϣ��

����:
```lua
-- tostring����
function class.object:__tostring()
    if self then
        local ret = '[' .. self.__type .. ' : ' .. self.__classname .. ']'
        if self.__instance_id then
            ret = ret .. ' @' .. tostring(self.__instance_id)
        end
        return ret
    end
    return '[class : object] WARNING: you should use obj:__tostring but obj.__tostring'
end
```
���tostring�������ӡ����ǰ������͡�������ID����Щ���ݶ��ᰴ����ʽ�Ĳ��ҹ���һ��һ������ϲ��ҡ������ID��ָ����ÿ����һ����ʵ���������һ��ΨһID����**����**�����ﶼ��class������ʵ���ﶼ��object�����������ͺ�����ᵽ��

### C++ binding���������

C++���Ͱ��Ժ�Ҳ���ߵ�����Ļ��ƣ�����һ���ĵط��ǣ�������__tostring���������ڱ��أ�Ҳ����C++��ʵ�֣����Ұ�**����**��Ϊ*native code*��

�������lua�ﱣ��C++����һ��Ҫ��metatable���Ԥ����õ�Ԫ��Ϊ�˱���C++�ĳ�Ա��������̬���������ǲ��������½ṹ��

```flow
static_table=>operation: ��̬��Ա��
mem_table=>operation: ��Ա������������
meta_table=>operation: ��������Ԫ��
inst_table=>operation: ��ʵ��

static_table->mem_table
mem_table->meta_table
meta_table->inst_table
```

Ȼ�����Ӧ�ĺ��������ڶ�Ӧ��table�Ͼ����¶���

### �����������ռ�

�ܶ�����¶����õ��������������Ǿ͸ɴ��������������������಻ͬ�ĵط����ڣ�������new�������ᴴ����ʵ������ֱ�ӷ����������һ�����һ��instance����Ϊnew�����ı�����

```lua
-- ��������
do
    class.singleton = class.register('utils.class.singleton')
    rawset(class.singleton, 'new', function(self, inst)
        if nil == self then
            log_error('singleton class must using class:new or class:instance(class.new and class.instance is unavailable)')
            return nil
        end
        return self
    end)

    rawset(class.singleton, 'instance', class.singleton.new)
end
```

Ϊ�˷����������֣�ע�����ʱ������������� a.b.c.d ��·������ô��ʱ��a��a.b��a.b.c�Ͷ��������ռ䣨�����ǰû��ע���Ϊ�ࣩ�������ռ�Ҳ��һ��������

```lua
-- �����ռ�
class.namespace = class.register('utils.class.namespace', class.singleton)
```

### �����������ݺ�constģ��

������ʵ��Ӧ���У�Ϊ�˷�ֹһЩ���������ҪһЩ����������һЩ���ݡ�����˵��a.b.c = 123������Lua�����ݴ��ݶ������õķ�ʽ�������ʱ�� b �ǻ������table���ͻ�ʹ�û�����Ķ������Ķ���Ϊ�˷�ֹ������������Ǽ���һ���������ڱ����������ݡ�

���������ǣ���table������������֮ǰ����һ��table������__newindex���ڱ������ݡ�Ȼ��������Ƽ̳еķ�ʽ�������ݡ�

```lua
-- ����table����
function class.protect(obj, r)
    -- ��readonly���õ��Ż�
    local tmb = getmetatable(obj)
    if tmb and class.readonly__newindex == tmb.__newindex then
        obj = tmb.__index
    end

    local wrapper = {}
    local wrapper_metatable = {}
    setmetatable(wrapper, wrapper_metatable)

    for k, v in pairs(obj) do
        if r and 'table' == type(v) or 'userdata' == type(v) then
            rawset(wrapper, k, class.protect(v, r))
        else
            rawset(wrapper, k, v)
        end
    end

    rawset(wrapper_metatable, '__index', obj)
    rawset(wrapper_metatable, '__newindex', function(tb, k, v)
        rawset(tb, k, v)
    end)
    return wrapper
end
```

���⣬�ر������ñ�Ϊ�˷�ֹʹ���߶����޸ġ����ǻ���Ҫһ�����ó�*readonly*�Ĺ��ܣ�Ҳ����**ģ��const**���ܡ�

readonly��ʵ��ԭ��Ͷ������ݱ����ķ������ơ�Ҳ������__newindex�������ұ���������һ����֪�����⣬�������ַ����Ժ�next��unpack��pair��ipair��������ΪʧЧ�ˡ��������Ǽ��˼�������������������⡣

```lua
-- readonly ����__newindex����
function class.readonly__newindex(tb, key, value)
    log_error('table %s is readonly, set key %s is invalid', tostring(tb), tostring(key))
end

-- ����tableΪreadonly
function class.set_readonly(obj)
    local tmb = getmetatable(obj)
    if not tmb or class.readonly__newindex ~= tmb.__newindex then
        local wrapper = {
            __index = obj,
            __newindex = class.readonly__newindex,
        }

        -- ����readonly�� # ������ʧЧ�Ľ������
        function wrapper:table_len() 
            return #obj
        end

        -- ����readonly��pairsʧЧ�Ľ������
        function wrapper:table_pairs() 
            return pairs(obj)
        end

        -- ����readonly��ipairsʧЧ�Ľ������
        function wrapper:table_ipairs() 
            return ipairs(obj)
        end
        
        -- ����readonly��nextʧЧ�Ľ������
        function wrapper:table_next(index) 
            return next(obj, index)
        end

        -- ����readonly��unpackʧЧ�Ľ������
        function wrapper:table_unpack(index) 
            return table.unpack(obj, index)
        end

        -- ԭʼtable
        function wrapper:table_raw() 
            return obj
        end

        -- ���ƿ�д��
        function wrapper:table_make_writable() 
            local ret = table.extend(obj)
            for k, v in pairs(ret) do
                if 'table' == type(v) then
                    rawset(ret, k, v:table_make_writable())
                else
                    rawset(ret, k, v)
                end
            end

            return ret
        end

        setmetatable(wrapper, wrapper)

        for k, v in pairs(obj) do
            if 'table' == type(v) or 'userdata' == type(v) then
                rawset(obj, k, class.set_readonly(v))
            end
        end
        return wrapper
    end
    return obj
end
```

���˭�и��õķ���ϣ���ܲ��ߴͽ̡�

������������ڹ���
------

��������ǵ�C++���������������Lua������Lua��table�ͷŵ�ʱ����__gc�������C++����ִ��delete������ʵ�ʵ�ʹ�ù����з���һ�������ص����⣬����Lua���ڴ����ʱ���ǲ�ȷ���ġ�����ζ�ŷ������ִ�н��볡����ʱ���д����Ĳ���Ҫ�Ķ���û���ͷŵ����˷��˺ܶ��ڴ档

Ȼ�����ÿ��ǿ��Lua�����������ջ������������ܣ����Ժ������ǲ�ȡ����һ�ַ�������Lua�м�¼C++����������ã��ڱ��ش�����ʹ�ù�������������Щ����

ʵ�������Ǹ�Lua�󶨵�C++���������һ��weak_ptr���ڱ��ش���������б���Ķ����shared_ptr�����ó�Ա����ʱ����������Ѿ����ͷţ���ᱨ������ʧ�ܡ�

���ڱ��ض����������ڹ������ǲ���������cocos����������������ѭ�����shared_ptr�ŵ�һ������أ������ü���+1����Ȼ��������һ����ѭ����ʱ����ա���������lua�㴴���Ķ����ʼֻ��һ�������ڻ�����������������Ժ�û����ӵ�����ģ���У���һ����ѭ����ʱ�򼴻����١��������ӵ�������ģ���У�����չ�����ת�Ƹ����Ǹ�ģ�顣

```lua
local ut = unit.new(unit_id) -- ��������������ü���Ϊ1���ڻ��������û�л���أ����ü���Ϊ0���ͻᱻ����
-- ut ֻ��һ�������ã�����Ӱ��ʵ�ʵĶ������
```


�������ͺͺ����������Զ��ж�
------

Lua��C++������ʱ���п��ܳ��ָ��ֺ������͡�Ϊ�˼��ٴ��룬���Ǵ���ʹ����C++11�����ԣ���Ҫ��function��lambda���ʽ��type_traits�Ͷ�̬ģ�������������C++��ģ������Ƶ��������Զ����������������Ա������

```cpp
/**
 * ������ӷ������Զ��ƶ�����
 *
 * @tparam  TF  Type of the tf.
 * @param   func_name   Name of the function.
 * @param   fn          The function.
 */
template<typename R, typename... TParam>
self_type& addMethod(const char* func_name, R(*fn)(TParam... param)) {
    lua_State* state = getLuaState();
    lua_pushstring(state, func_name);
    lua_pushlightuserdata(state, reinterpret_cast<void*>(fn));
    lua_pushcclosure(state, detail::unwraper_static_fn<R, TParam...>::LuaCFunction, 1);
    lua_settable(state, getStaticClassTable());

    return (*this);
}
```

�����Ѻ���ָ������һ��lua�հ������趨**detail::unwraper_static_fn<R, TParam...>::LuaCFunction**Ϊ�հ�����������������ʹ����һЩС���ɰ�Lua����Ĳ�����C++�����Ĳ������򵼳�ת���������������ָ�롣

�þ�̬�����ٸ����Ӿ��ǣ�
```cpp
/*************************************\
|* ��̬����Lua�󶨣���̬��������          *|
\*************************************/
template<typename Tr, typename... TParam>
struct unwraper_static_fn : public unwraper_static_fn_base<Tr> {
    typedef unwraper_static_fn_base<Tr> base_type;
    typedef Tr (*value_type)(TParam...);

     
    // ��̬��������
    static int LuaCFunction(lua_State* L) {
        value_type fn = reinterpret_cast<value_type>(lua_touserdata(L, lua_upvalueindex(1)));
        if (nullptr == fn) {
            // �Ҳ�������
            return 0;
        }

        return base_type::template run_fn<value_type, std::tuple<
            typename std::remove_cv<typename std::remove_reference<TParam>::type>::type...
        > >(L,
            fn,
            typename build_args_index<TParam...>::index_seq_type()
        );
    }
};
```

������Ѻ������ͺ�˳��ŵ���**tuple<...>**�ﲢ�Ƴ������úͳ�����ʶ���Ƴ����úͳ�����ʶ��ԭ�������������չ���������ʱ�����һ����ֵ���������Щ��ʶ�ᵼ��C++�����ͼ�鲻ͨ������������ʱ����-Ҳ������ֵ-����תΪ��ֵ���ã�����ʹ��**build_args_index<TParam...>::index_seq_type()**��ʵ��ö�ٳ������֣�1,2...����������Ҳ�����*build_args_index*ʹ����һ���漼���ɣ�type_traits����

```cpp
template<int... _index>
struct index_seq_list{ typedef index_seq_list<_index..., sizeof...(_index)> next_type; };

template <typename... TP>
struct build_args_index;

template <>
struct build_args_index<>
{
    typedef index_seq_list<> index_seq_type;
};

template <typename TP1, typename... TP>
struct build_args_index<TP1, TP...>
{
    typedef typename build_args_index<TP...>::index_seq_type::next_type index_seq_type;
};
```

�����**run_fn**��Ѳ��������ó�������������run_fn�ο�����:

```cpp
template<typename Tfn, class TupleT, int... N >
static int run_fn(lua_State* L, Tfn fn, index_seq_list<N...>) {
    fn(
        unwraper_var<typename std::tuple_element<N, TupleT>::type>::unwraper(
            L, 
            N + 1
        )...
    );
    return 0;
}
```

������C++ģ���Ƶ��Ĺ����Ʋ�ͬ������ת������(unwraper_var::unwraper)����ָ��index�����ݵ�������������Ϊ�����Ĳ������ɡ�

C++��Lua����������ת��
------

�������ᵽ*����C++ģ���Ƶ��Ĺ����Ʋ�ͬ������ת������*��ʵ�������ǳ����а����ݴ�Lua����������C++�������⻹�дӰ�C++���ݴ���Lua�����Գ��������ᵽ��unwraper_var::unwraper�⻹��wraper_var::wraper��

���ǵ�ʵ��ԭ��һ������������C++��ƫ�ػ���ģ������ƥ����򡣶������ǳ��˶Ի����������͡������ö�����������������⣬����һЩ���õ�STL�������������䣬����std::string��std::array��std::vector��std::pair����vector�ٸ����ӣ�

```cpp
// C++����תLua table
template<typename Ty, typename... Tl>
struct wraper_var<std::vector<Ty>, Tl...> {
    static int wraper(lua_State* L, const std::vector<Ty>& v) {
        lua_Unsigned res = 1;
        lua_newtable(L);
        int tb = lua_gettop(L);
        for (const Ty& ele : v) {
            // Ŀǰֻ֧��һ��ֵ
            lua_pushunsigned(L, res);
            wraper_var<Ty>::wraper(L, ele);
            lua_settable(L, -3);

            ++res;
        }
        lua_settop(L, tb);
        return 1;
    }
};

// Lua����תC++����
template<typename Ty, typename... Tl>
struct unwraper_var<std::vector<Ty>, Tl...> {
    static std::vector<Ty> unwraper(lua_State* L, int index) {
        std::vector<Ty> ret;
        LUA_CHECK_TYPE_AND_RET(table, L, index, ret);

        LUA_GET_TABLE_LEN(size_t len, L, index);
        ret.reserve(len);

        lua_pushvalue(L, index);
        for (size_t i = 1; i <= len; ++i) {
            lua_pushinteger(L, static_cast<lua_Unsigned>(i));
            lua_gettable(L, -2);
            ret.push_back(unwraper_var<Ty>::unwraper(L, -1));
            lua_pop(L, 1);
        }
        lua_pop(L, 1);

        return ret;
    }
};
```

ͨ�����ַ�ʽ�����ǿ��Ժ����׵�ʹ��stl��Ϊ������������ʵ�ְ󶨻��Ƶ��Զ������ж�������������Զ����������ͣ�ֻҪд**unwraper_var��wraper_var��������͵�ƫ�ػ�**���ɣ����ҿ��Ժ������Ѿ��󶨵�����֮������Ƕ��ʹ�á�������: *std::vector&lt;std::string&gt;*��


����Ϊ�˷������Lua���������ǻ�д��һ���Զ���������������lua�����Ľӿڣ�

```cpp
/**
 * @brief �Զ��������lua����
 * @return �����������������ֵС��0�򲻻�ı��������
 */
template<typename... TParams>
int auto_call(lua_State* L, int index, TParams&&... params);
```

��ʵ��ԭ���ǰ������Ա������һ�������ǹ��ܷ��������ѡ�

�Զ�����
------

Ϊ���ô�����򵥣�����ʹ�����е���gtest����Զ��������ơ�

**LUA_BIND_OBJECT**�����ᶨ��һ��������һ��statis��ȫ�ֱ�������Ϊȫ�ֱ��������������ǳ��������󣬽���main����ǰ��Ϊ�˱�֤һЩǰ��������Ч�����������ȫ�ֱ����Ĺ��캯���ڰ��������ָ����ӵ�Lua�󶨵Ĺ�������**LuaBindingMgr**���У����ڹ�������ʼ��������*LuaBindingMgr::init*����ʱ��ִ����Щ����������������ռ����İ󶨲�����

������ͬģ��Ŀ����߲���Ҫд����Ĵ��룬���Ҳ���ҪȥƵ���Ķ��ϲ��Lua�󶨹�������������Ϊ��һ��������ת��������

���
------

���ǵ�Lua�󶨻��ƺ��ĵĲ��ִ����Ͼ���ô�࣬Ŀǰ����󶨻��Ʋ������������ǹ������Ѿ�������Ŀǰ��������������Ժ���ǿ�ҵ������ʱ������ټӡ�����ȱʧ�Ĳ��ְ����ݲ�֧�ֳ�Ա�������Զ��������صĺ����ȡ�

������Ƶ�ͼ������׼����Ϊstackeditor��markdown��ͼ�������ޡ�

�������ἰ�Ľṹ�����д��붼���й��� https://github.com/owent-utils/lua ����Ȥ��ͯЬ����ȡ��

> Written with [StackEdit](https://stackedit.io/).

