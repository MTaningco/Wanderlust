import json

# Using geonames-all-cities-with-a-population-1000.json from 
# https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000/export/?disjunctive.cou_name_en&sort=name
# Create cityLocationsGreaterThan500000.json and cityLocationsGreaterThan9000.json

with open('geonames-all-cities-with-a-population-1000.json', 'r') as openfile:
 
    # Reading from json file
    json_object = json.load(openfile)
 

dictionary500000 = []
dictionary9000 = []
index = 0
for item in json_object:
    print("progress: ", index/137520)
    population = item["fields"]["population"]
    if population > 9000:
        newItem = {}
        coordinates = [item["fields"]["coordinates"][1], item["fields"]["coordinates"][0]]
        newItem["c"] = coordinates
        newItem["p"] = population
        dictionary9000.append(newItem)
        if population > 500000:
            dictionary500000.append(newItem)
    index += 1

print("sorting dictionary...")
def takePopulation(elem):
    return elem["p"]
sortedDict9000 = sorted(dictionary9000, key=takePopulation)
sortedDict500000 = sorted(dictionary500000, key=takePopulation)

print("turning dictionary to json...")
json_object9000 = json.dumps(sortedDict9000)
json_object500000 = json.dumps(sortedDict500000)

print("writing json to file...")
with open("cityLocationsGreaterThan9000.json", "w") as outfile:
    outfile.write(json_object9000)
with open("cityLocationsGreaterThan500000.json", "w") as outfile:
    outfile.write(json_object500000)