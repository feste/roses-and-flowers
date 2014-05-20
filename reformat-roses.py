import re
import json

workers = {}
def symb(workerid):
	if workerid in workers:
		return workers[workerid]
	else:
		id_number = str(len(workers))
		workers[workerid] = id_number
		return id_number

def cutquotes(x, i):
	return x[i:-i]
def cutone(x):
	return cutquotes(x, 1)

# fillers = {"filler0": "Pat telephoned the sister of Sally`s friend yesterday."
#   , "filler1": "The gopher dug a tunnel underneath the fence."
#   , "filler2": "A math textbook and a spiral notebook were lying on the kitchen table."
#   , "filler3": "Adam and Charlie liked to play cops and robbers together when they were little."
#   , "filler4": "Nobody knew the solution to any of the logic puzzles in the book."
#   , "filler5": "Jill and Tom met at a cafe for their first date."}

# fillers = {"filler0": "pat telephoned"
#   , "filler1": "the gopher"
#   , "filler2": "math textbook"
#   , "filler3": "adam and charlie"
#   , "filler4": "nobody knew"
#   , "filler5": "jill and tom"}

# var fillers = {
#   "filler0":"Pat took out of the closet a stick of mud.",
#   "filler1":"A phone was unfolded by Bill.",
#   "filler2":"The mother of five plunged into a raucous fray.",
#   "filler3":"Off a cliff sprang the giddy diver.",
#   "filler4":"No person shall drink any beverage or chew noisily during class.",
#   "filler5":"Because the dog growled the robber fled.",
#   "filler6":"Alex telephoned the sister of Sally's friend yesterday."
# }

fillers = {
  "filler0":"pat closet",
  "filler1":"phone unfolded",
  "filler2":"mother of five",
  "filler3":"off a cliff",
  "filler4":"no person shall",
  "filler5":"dog growled",
  "filler6":"alex telephoned",
  "filler7":"john and mary"
}

f = open("roses-5-20-mturk.results")
line_number = 0
data = [["subject", "rating", "order", "frequency", "hasOther", "filler", "rt", "qNumber", "age", "language"]]

header_labels = []
for line in f:
	elements = line[:-1].split("\t")
	if line_number == 0:
		#get header labels
		header_labels = map(cutone, elements)
	else:
		#get data
		subject_data = {}
		trial_data = {"rating":[], "rt":[], "qNumber":[], "order":[], "frequency":[], "hasOther":[], "filler":[]}
		for i in range(len(elements)):
			element = cutone(elements[i])
			header_label = header_labels[i]
			if header_label == "workerid":
				subject_data["subject"] = symb(element)
			elif header_label[:6] == "Answer":
				shorter_header_label = header_label[7:]
				if shorter_header_label == "trials":
		# 			#get trial data
					element = re.sub("\"\"", "\"", element)
					element = json.loads(element)
					for trial in element:
						trialType = trial["trialType"]
						if type(trialType)==type(u'trialType'):
							if trialType[:-1] == "filler":
								filler = fillers[trialType]
								rating = str(trial["response"][-1])
								rt = str(trial["rt"][-1])
								qNumber = str(trial["qNumber"])
								order = "NA"
								frequency = "NA"
								hasOther = "NA"
								trial_data["filler"].append(filler)
								trial_data["rating"].append(rating)
								trial_data["rt"].append(rt)
								trial_data["order"].append(order)
								trial_data["frequency"].append(frequency)
								trial_data["hasOther"].append(hasOther)
								trial_data["qNumber"].append(qNumber)	
						else:
							rating = trial["response"][-1]
							rating = str(rating)
							rt = trial["rt"][-1]
							rt = str(rt)
							frequency = trialType["frequency"]
							hasOther = str(trialType["hasOther"])
							order = trialType["order"]
							qNumber = str(trial["qNumber"])
							trial_data["filler"].append("NA")
							trial_data["rating"].append(rating)
							trial_data["rt"].append(rt)
							trial_data["order"].append(order)
							trial_data["frequency"].append(frequency)
							trial_data["hasOther"].append(hasOther)
							trial_data["qNumber"].append(qNumber)
				else:
					if shorter_header_label == "comments":
						element = cutquotes(element, 2)
						# element = re.sub("\+", " ", element)
						# element = re.sub("\%2C", ",", element)
					elif shorter_header_label in ["age", "language"]:
						element = cutquotes(element, 2)
					subject_data[shorter_header_label] = element
		#subj data has the values: comments, age, language, subject
		#trial data has lists of ratings, rts, orders, frequencies, and hasOthers
		for k in range(len(trial_data["rating"])):
			filler = trial_data["filler"][k]
			rating = trial_data["rating"][k]
			rt = trial_data["rt"][k]
			order = trial_data["order"][k]
			frequency = trial_data["frequency"][k]
			hasOther = trial_data["hasOther"][k]
			subject = subject_data["subject"]
			comments = subject_data["comments"]
			age = subject_data["age"]
			language = subject_data["language"]
			data.append([subject, rating, order, frequency, hasOther, filler, rt, qNumber, age, language])
	line_number = line_number + 1

w = open("roses-5-20.results", "w")
def printyprint(x):
	return "\t".join(x)
w.write("\n".join(map(printyprint, data)))
w.close()