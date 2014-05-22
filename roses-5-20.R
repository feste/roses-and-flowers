library('lme4')
library('ggplot2')

# item="flowers"
# freq="roses"
# infreq="daffodils"
# item = "trees"
# freq = "oaks"
# infreq = "spruces"
# item="scientists"
# infreq="biologists"
# freq="paleontologists"
item="meat"
freq="beef"
infreq="veal"
# item="doctors"
# freq="surgeons"
# infreq="anesthesiologists"

df = read.table("roses-5-22.results", sep="\t", header=T)
#df = df[as.numeric(as.character(df$subject))>39,]
r = df[is.na(df$filler) & !is.na(df$frequency),]
r = r[r$item == item,]
r = r[r$item != "animal",]
filler = df[!(is.na(df$filler)),]
#print(summary(r))

# fit = lm(rating ~ frequency * order * hasOther, data=r)
# print(anova(fit))

conf <- function(v) {
  v <- v[is.na(v) == F]
  nsubj=length(v)
  sample.means <- replicate(100, mean(sample(v, nsubj, replace=TRUE)))
  return(quantile(sample.means, c(0.025, 0.975)))
}
lower.conf <- function(v) {
  conf(v)[["2.5%"]]
}
upper.conf <- function(v) {
  conf(v)[["97.5%"]]
}

pretty.name = function(f, ord, other) {
  if (f == "frequent") {
    if (ord == "subSuper") {
      if (other == "True") {
        return(paste(freq, "and other", item))
      } else {
        return(paste(freq, "and", item))
      }
    } else {
      return(paste(item, "and", freq))
    }
  } else {
    if (ord == "subSuper") {
      if (other == "True") {
        return(paste(infreq, "and other", item))
      } else {
        return(paste(infreq, "and", item))
      }
    } else {
      return(paste(item, "and", infreq))
    }
  }
}
r$cond = sapply(1:nrow(r), function(i) {
  pretty.name(r$frequency[i], r$order[i], r$hasOther[i])
})
r$cond = factor(r$cond, levels=c(
  paste(item, "and", freq),
  paste(freq, "and", item),
  paste(freq, "and other", item),
  paste(item, "and", infreq),
  paste(infreq, "and", item),
  paste(infreq, "and other", item)
  #   "flowers and roses",
#   "roses and flowers",
#   "roses and other flowers",
#   "flowers and daffodils"
#   "daffodils and flowers",
#   "daffodils and other flowers",
))

filler.map = list(
  "adam and charlie"="Adam and Charlie liked to play cops and robbers together when they were little.",
  "jill and tom"="Jill and Tom met at a cafe for their first date.",
  "math textbook"="A math textbook and a spiral notebook were lying on the kitchen table.",
  "nobody knew"="Nobody knew the solution to any of the logic puzzles in the book.",
  "pat telephoned"="Pat telephoned the sister of Sally's friend yesterday.",
  "the gopher"="The gopher dug a tunnel underneath the fence.",
  "off a cliff"="Off a cliff sprang the giddy driver."
  
)

#dependent measure = rating
#filler$filler = factor(filler$filler, levels=levels(filler$filler), label=sapply(levels(filler$filler), function(f) {return(filler.map[[f]])}))
filler$cond = filler$filler
counts.per.type = aggregate(subject ~ cond, data=r, length)
#r$cond = paste(r$cond, sapply(r$cond, function(condition) {return(counts.per.type$subject[counts.per.type$cond == condition])}))
target.rating.means = aggregate(rating ~ cond, data=r, mean)
target.rating.upper = aggregate(rating ~ cond, data=r, upper.conf)
target.rating.lower = aggregate(rating ~ cond, data=r, lower.conf)
filler.rating.means = aggregate(rating ~ cond, data=filler, mean)
filler.rating.upper = aggregate(rating ~ cond, data=filler, upper.conf)
filler.rating.lower = aggregate(rating ~ cond, data=filler, lower.conf)
rating.means = rbind(target.rating.means, filler.rating.means)
rating.upper = rbind(target.rating.upper, filler.rating.upper)
rating.lower = rbind(target.rating.lower, filler.rating.lower)
rating.means$count = sapply(rating.means$cond, function(condition) {
  if (condition %in% counts.per.type$cond) {
    return(counts.per.type$subject[as.character(counts.per.type$cond) == as.character(condition)])
  } else {
    return(30)
  }
})   
rating.means$count = paste("n =", rating.means$count)

# ggplot(data=target.rating.means, aes(x=cond, y=rating, fill=cond)) +
#   geom_bar(colour="black", stat="identity") +
#   ggtitle("aggregated ratings") +
#   #ggtitle(paste("ratings for ",item)) +
#   theme(plot.title = element_text(face="bold")) +
#   #scale_fill_discrete(name="Trial Type", labels=c(sapply(levels(filler$cond), function(f) {return(paste("FILLER:", filler.map[[f]]))}))) +
#   scale_fill_manual(values=c("#fb9a99",
#                              "#e31a1c",
#                              "#b2df8a", "#33a02c",
#                              "#a6cee3",
#                              "#1f78b4")) + 
#   geom_errorbar(aes(ymin=target.rating.lower$rating, ymax=target.rating.upper$rating), width=.1) +
#   geom_line() +
#   geom_point()

ggplot.rainbow = function(n) {
  return(sapply(0:(n-1), function(i) {
#     return(hcl(h=(i*(360/n)), c=100, l=65))
    return(hcl(h=((360-(i+1))*(360/n)), c=100, l=65))
  }))
}

ggplot(data=rating.means, aes(x=cond, y=rating, fill=cond)) +
  geom_bar(colour="black", stat="identity") +
  #ggtitle(paste("ratings for ",item)) +
  ggtitle("aggregated ratings with fillers") +
  #theme(plot.title = element_text(face="bold")) +
#   scale_fill_discrete(
#     name="Trial Type",
#     labels=c(levels(r$cond), sapply(levels(filler$cond), function(f) {return(paste("FILLER:", filler.map[[f]]))}))
#   ) +
  scale_fill_manual(
    name="Trial Type",
    labels=c(levels(r$cond), sapply(levels(filler$cond), function(f) {return(paste("FILLER:", filler.map[[f]]))})),
#     values=c(c("#fb9a99", "#e31a1c", "#b2df8a", "#33a02c", "#a6cee3", "#1f78b4"),
#              ggplot.rainbow(6))) + 
    values=c(c("#FF7F9C", "#FF0036", "#B20026", "#FFFAA0", "#FFF100", "#B2A900",
             ggplot.rainbow(9)[2:6]))) +
             #"#333333", "#414141", "#4e4e4e", "#8d8d8d", "#cdcdcd")) +
  geom_errorbar(aes(ymin=rating.lower$rating, ymax=rating.upper$rating), width=.1) +
  geom_line() +
  geom_point() +
  geom_text(data=rating.means, aes(x=cond, y=0.02, label=count), colour="black")
# 
# #dependent measure = rt
# target.rt.means = aggregate(rt ~ cond, data=r, mean)
# target.rt.upper = aggregate(rt ~ cond, data=r, upper.conf)
# target.rt.lower = aggregate(rt ~ cond, data=r, lower.conf)
# filler.rt.means = aggregate(rt ~ cond, data=filler, mean)
# filler.rt.upper = aggregate(rt ~ cond, data=filler, upper.conf)
# filler.rt.lower = aggregate(rt ~ cond, data=filler, lower.conf)
# rt.means = rbind(target.rt.means, filler.rt.means)
# rt.upper = rbind(target.rt.upper, filler.rt.upper)
# rt.lower = rbind(target.rt.lower, filler.rt.lower)
# 
# ggplot(data=rt.means, aes(x=cond, y=rt, fill=cond)) +
#   geom_bar(colour="black", stat="identity") +
#   ggtitle("Reaction Time") +
#   theme(plot.title = element_text(face="bold")) +
#   scale_fill_manual(values=c("#fb9a99", "#e31a1c", "#b2df8a", "#33a02c", "#a6cee3", "#1f78b4")) + 
#   geom_errorbar(aes(ymin=rt.lower$rt, ymax=rt.upper$rt), width=.1) +
#   geom_line() +
#   geom_point()
# 
# ggplot(data=rt.means, aes(x=cond, y=rt, fill=cond)) +
#   geom_bar(colour="black", stat="identity") +
#   ggtitle("Reaction Time") +
#   theme(plot.title = element_text(face="bold")) +
#   scale_fill_manual(
#     name="Trial Type",
#     labels=c(levels(r$cond), sapply(levels(filler$cond), function(f) {return(paste("FILLER:", filler.map[[f]]))})),
#     values=c(c("#fb9a99", "#e31a1c", "#b2df8a", "#33a02c", "#a6cee3", "#1f78b4"),
#              ggplot.rainbow(6))) + 
#   geom_errorbar(aes(ymin=rt.lower$rt, ymax=rt.upper$rt), width=.1) +
#   geom_line() +
#   geom_point()
