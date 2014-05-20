#library('lme4')
library('ggplot2')

r = read.table("roses-4-28.results", sep="\t", header=T)
r = r[r$subject>109,]
r = r[r$language != "English%2FChinese",]

ggplot.rainbow = function(n) {
  return(sapply(0:(n-1), function(i) {
    #     return(hcl(h=(i*(360/n)), c=100, l=65))
    return(hcl(h=((360-(i+1))*(360/n)), c=100, l=65))
  }))
}

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

filler.map = list(
  "pat closet"="Pat took out of the closet a stick of mud.",
  "phone unfolded"="A phone was unfolded by Bill.",
  "mother of five"="The mother of five plunged into a raucous fray.",
  "off a cliff"="Off a cliff sprang the giddy diver.",
  "no person shall"="No person shall drink any beverage or chew noisily during class.",
  "dog growled"="Because the dog growled the robber fled.",
  "alex telephoned"="Alex telephoned the sister of Sally's friend yesterday.",
  "john and mary"="John and Mary met at a cafe for their first date."
)

# #dependent measure = rating
filler.rating.means = aggregate(rating ~ filler, data=r, mean)
filler.rating.upper = aggregate(rating ~ filler, data=r, upper.conf)
filler.rating.lower = aggregate(rating ~ filler, data=r, lower.conf)
filler.rating.means$filler = factor(filler.rating.means$filler, levels=c("john and mary", "no person shall",
                                                                         "mother of five", 
                                                                         "dog growled",    
                                                                         "alex telephoned", "off a cliff",
                                                                         "phone unfolded", "pat closet"))
filler.rating.upper$filler = factor(filler.rating.upper$filler, levels=c("john and mary", "no person shall",
                                                                         "mother of five",  
                                                                         "dog growled",   
                                                                         "alex telephoned", "off a cliff",
                                                                         "phone unfolded", "pat closet"))
filler.rating.lower$filler = factor(filler.rating.lower$filler, levels=c("john and mary", "no person shall",
                                                                         "mother of five", 
                                                                         "dog growled",    
                                                                         "alex telephoned", "off a cliff",
                                                                         "phone unfolded", "pat closet"))
# 
ggplot(data=filler.rating.means, aes(x=filler, y=rating, fill=filler)) +
  geom_bar(colour="black", stat="identity") +
  ggtitle("instructions norm") +
  scale_fill_manual(
    name="Sentences",
    labels=sapply(levels(filler.rating.means$filler), function(f) {
      return(filler.map[[f]])
    }),
    values=ggplot.rainbow(8)) + 
  geom_errorbar(aes(ymin=filler.rating.lower$rating,
                    ymax=filler.rating.upper$rating),
                width=.1) +
  geom_line() +
  geom_point() +
  theme_gray(18)
# 

# 
# ggplot(data=rating.means, aes(x=cond, y=rating, fill=cond)) +
#   geom_bar(colour="black", stat="identity") +
#   #ggtitle(paste("ratings for ",item)) +
#   ggtitle("aggregated ratings with fillers") +
#   #theme(plot.title = element_text(face="bold")) +
# #   scale_fill_discrete(
# #     name="Trial Type",
# #     labels=c(levels(r$cond), sapply(levels(filler$cond), function(f) {return(paste("FILLER:", filler.map[[f]]))}))
# #   ) +
#   scale_fill_manual(
#     name="Trial Type",
#     labels=c(levels(r$cond), sapply(levels(filler$cond), function(f) {return(paste("FILLER:", filler.map[[f]]))})),
#     values=c(c("#fb9a99", "#e31a1c", "#b2df8a", "#33a02c", "#a6cee3", "#1f78b4"),
#              ggplot.rainbow(6))) + 
#   geom_errorbar(aes(ymin=rating.lower$rating, ymax=rating.upper$rating), width=.1) +
#   geom_line() +
#   geom_point()
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
