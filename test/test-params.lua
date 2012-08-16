
local args = process.argv or {}

local flat = args

local sir = "-"
local par ="=.*"

--  shift ? 
flat[1] = nil
local params =  {}
for key in pairs(flat)  do
    local attr = tostring(flat[key])
    local attri, value  = attr.match(attr, "(%a+)%s*=%s*(%a+)")
    if attri == nil or value == nil then
        attri = attr
        value = tostring(flat[key + 1])
        flat[key + 1] = nil
    end
    params[attri] = value
end

print(params.lool)
print(params.lul)
print(params.presion)