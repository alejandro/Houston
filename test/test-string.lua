

if not string then string = require('string') end
if not table then table = require('table') end

function string:has (wat)
    
    local i, e = string.find(tostring(self), wat)
    if i ~= nil or e ~= nil then
        return true
    end
end

function flatten(tbl)
  local values, i, withoutv = {}, 0, {}
  for v in pairs(tbl) do
    i = i + 1
    if tbl[v] then 
        values[i] = tbl[v] 
        withoutv[v] = v
    end
  end
  for v in ipairs(tbl) do
    i = i + 1
    values[i] = v
    withoutv[v] = v
  end

  return values, withoutv
end


function table:has (wat)
    local tbl = self
    local all, keys = flatten(tbl)
    for key in ipairs(all) do
        if all[key] == wat then return true end
    end
    if keys[wat] then return true end
end

local test = {
    one = true,
    dos = false,
    tres = {},
    1, 2, 3
}

local fs = require('fs')

local dir = fs.readdirSync('/home/alejandro/dev/lua')

-- for key in ipairs(dir) do
--     print(dir[key])
-- end
-- if table.has(dir, 'etables.lua') then
--     print('has')
-- end
-- if table.has(test, 'onse') then
--     print('has')
-- end

local c = "alejo"
c = c .. "process" ..
"crazy"

print(c)